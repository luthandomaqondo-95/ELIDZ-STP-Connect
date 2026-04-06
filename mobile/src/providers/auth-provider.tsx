import { AuthContext } from '@/hooks/use-auth-context';
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'
import { PropsWithChildren, useEffect, useState } from 'react'
import { Profile } from '@/types'
import * as Sentry from '@sentry/react-native';
import * as ExpoLinking from 'expo-linking';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { router } from 'expo-router';

/** Parse auth params from OAuth callback URL (handles both hash and query params). */
function getAuthParamsFromUrl(url: string): { code?: string; access_token?: string; refresh_token?: string } {
	const [baseAndQuery, hashRaw = ''] = url.split('#');
	const queryRaw = baseAndQuery.includes('?') ? baseAndQuery.split('?').slice(1).join('?') : '';
	const hash = hashRaw.startsWith('?') ? hashRaw.slice(1) : hashRaw;
	const hashParams = new URLSearchParams(hash);
	const searchParams = new URLSearchParams(queryRaw);
	const get = (key: string) => hashParams.get(key) ?? searchParams.get(key) ?? null;
	return {
		code: get('code') ?? undefined,
		access_token: get('access_token') ?? undefined,
		refresh_token: get('refresh_token') ?? undefined,
	};
}

/** Redirect URL for email confirmation. Use web URL when set so links work when opened in Gmail/browser. */
function getEmailConfirmationRedirectUrl(): string {
	const appWebUrl = Constants.expoConfig?.extra?.appWebUrl as string | undefined;
	if (appWebUrl?.trim()) {
		return `${appWebUrl.replace(/\/$/, '')}/auth/email-confirmed`;
	}
	return Constants.appOwnership === 'expo'
		? ExpoLinking.createURL('email-confirmed')
		: 'elidzstp://email-confirmed';
}

const ACCOUNT_SUSPENDED_MESSAGE =
	'Your account has been suspended. If you believe this is a mistake, please contact support.';

function isAccountSuspended(row: {
	verification_status?: string | null;
	status?: string | null;
} | null): boolean {
	if (!row) return false;
	const v = String(row.verification_status ?? '').toLowerCase();
	const s = String(row.status ?? '').toLowerCase();
	return v === 'suspended' || s === 'suspended';
}

function isInvalidRefreshTokenError(error: unknown): boolean {
	const message =
		typeof error === 'object' && error !== null && 'message' in error
			? String((error as { message?: unknown }).message ?? '')
			: '';
	const code =
		typeof error === 'object' && error !== null && 'code' in error
			? String((error as { code?: unknown }).code ?? '')
			: '';

	return /invalid refresh token|refresh token not found/i.test(message) || code === 'refresh_token_not_found';
}

export default function AuthProvider({ children }: PropsWithChildren) {
	const [session, setSession] = useState<Session | undefined | null>()
	const [profile, setProfile] = useState<Profile | null>()
	const [isLoading, setIsLoading] = useState<boolean>(true)

	async function loadProfile(userId: string) {
		try {
			const { data, error } = await supabase
				.from('profiles')
				.select('*')
				.eq('id', userId)
				.single();

			if (error) {
				if (error.code === 'PGRST116') {
					Sentry.captureMessage('Profile not found for user (yet).');
					setProfile(null);
					return;
				}
				setProfile(null);
				Sentry.captureException(error);
				return;
			}

			if (data) {
				if (isAccountSuspended(data as Profile)) {
					await supabase.auth.signOut();
					setProfile(null);
					return;
				}
				setProfile(data as Profile);
			}
		} catch (error) {
			Sentry.captureException(error);
			setProfile(null);
		}
	}

	async function login(email: string, password: string) {
		// Normalize email to lowercase to match signup behavior
		const normalizedEmail = email.trim().toLowerCase();
		
		console.log('AuthProvider.login: Attempting login with email:', normalizedEmail);
		
		const { data, error } = await supabase.auth.signInWithPassword({
			email: normalizedEmail,
			password,
		});

		if (error) {
			console.warn('AuthProvider.login: Login error:', error?.message ?? error);
			const msg = typeof error.message === 'string' ? error.message : '';
			const code = typeof (error as { code?: string }).code === 'string' ? (error as { code?: string }).code : '';
			// Email not confirmed (AuthApiError / email_not_confirmed)
			if (code === 'email_not_confirmed' || /email not confirmed/i.test(msg)) {
				throw new Error('Please check your email and confirm your account before logging in.');
			}
			// Invalid credentials
			if (code === 'invalid_credentials' || /invalid login credentials/i.test(msg)) {
				throw new Error('Invalid email or password. Please check your credentials and try again.');
			}
			throw new Error(msg || 'Something went wrong. Please try again.');
		}

		console.log('AuthProvider.login: Login successful, user:', data?.user?.email);
		
		if (data?.user) {
			const { data: statusRow } = await supabase
				.from('profiles')
				.select('verification_status')
				.eq('id', data.user.id)
				.maybeSingle();
			if (isAccountSuspended(statusRow)) {
				await supabase.auth.signOut();
				throw new Error(ACCOUNT_SUSPENDED_MESSAGE);
			}
			await loadProfile(data.user.id);
		}
	}

	async function signup(name: string, email: string, password: string, role: Profile['role'], address: string, idNumber?: string) {
		const trimmedName = name.trim();
		const normalizedEmail = email.trim().toLowerCase();
		const normalizedAddress = address.trim();
		const trimmedIdNumber = (idNumber ?? '').trim() || null;

		const { data: authData, error: authError } = await supabase.auth.signUp({
			email: normalizedEmail,
			password,
			options: {
				emailRedirectTo: getEmailConfirmationRedirectUrl(),
				data: {
					name: trimmedName,
					role,
					address: normalizedAddress,
					id_number: trimmedIdNumber,
				}
			}
		});

		if (authError) {
			const message = authError.message ?? '';
		if (/email rate limit exceeded|over_email_send_rate_limit/i.test(message)) {
			throw new Error(
				'Too many email requests. Please wait up to an hour before trying again. If you already signed up, check your email (including spam) for the confirmation link, or try logging in instead.'
			);
			}
			if (/user already registered|already been registered/i.test(message)) {
				throw new Error(
					'This email is already registered. Please confirm your email first, or log in if you already confirmed.'
				);
			}
			throw new Error(authError.message);
		}

		if (!authData?.user) {
			throw new Error('Failed to create user account');
		}

		const userId = authData.user.id;
		
		// Check if email confirmation is required
		const requiresEmailConfirmation = authData.user.email_confirmed_at === null;

		const { error: profileError } = await supabase
			.from('profiles')
			.upsert(
				{
					id: userId,
					name: trimmedName,
					email: normalizedEmail,
					role,
					address: normalizedAddress,
					id_number: trimmedIdNumber,
				},
				{ onConflict: 'email' }
			);

		if (profileError) {
			const missingAddressColumn =
				/could not find the ['"]?address['"]? column of ['"]?profiles['"]? in the schema cache/i.test(
					profileError.message ?? ''
				);
			if (missingAddressColumn) {
				throw new Error(
					'Database schema is missing profiles.address (or schema cache is stale). Run the Supabase SQL migration: mobile/database/fix_profiles_address_column_schema_cache.sql'
				);
			}
			if (profileError.code === '23505' && /profiles_email_key|duplicate key.*email/i.test(profileError.message ?? '')) {
				throw new Error(
					'This email is already registered. Please log in or use a different email address.'
				);
			}

			// 42501 = permission denied, 23503 = foreign key violation (e.g. connections_user_id_fkey)
			// Use RPC which updates related tables before reassigning profile id
			if (profileError.code === '42501' || profileError.code === '23503') {
				const { error: rpcError } = await supabase.rpc('create_user_profile', {
					p_user_id: userId,
					p_name: trimmedName,
					p_email: normalizedEmail,
					p_role: role,
					p_address: normalizedAddress,
					p_organization: null,
					p_bio: null,
					p_avatar: 'blue',
					p_id_number: trimmedIdNumber,
				});

				if (rpcError) {
					const missingAddressColumnRpc =
						/could not find the ['"]?address['"]? column of ['"]?profiles['"]? in the schema cache/i.test(
							rpcError.message ?? ''
						);
					if (missingAddressColumnRpc) {
						throw new Error(
							'Database schema is missing profiles.address (or schema cache is stale). Run the Supabase SQL migration: mobile/database/fix_profiles_address_column_schema_cache.sql'
						);
					}
					throw new Error(rpcError.message);
				}
			} else {
				throw new Error(profileError.message);
			}
		}

		// If email confirmation is required, throw a special error that the UI can handle
		if (requiresEmailConfirmation) {
			throw new Error('EMAIL_CONFIRMATION_REQUIRED: Please check your email to confirm your account before logging in.');
		}

		// Set session immediately so auth state is ready before navigation (fixes race where
		// user signs up, navigates to tabs, then clicks Messages before onAuthStateChange fires)
		if (authData.session) {
			setSession(authData.session);
			await loadProfile(userId);
		}
	}

	async function resendSignupConfirmation(email: string) {
		const normalizedEmail = email.trim().toLowerCase();
		if (!normalizedEmail) {
			throw new Error('Please enter your email first.');
		}

		const RESEND_TIMEOUT_MS = 15000;
		const resendPromise = supabase.auth.resend({
			type: 'signup',
			email: normalizedEmail,
			options: {
				emailRedirectTo: getEmailConfirmationRedirectUrl(),
			},
		});

		// Supabase can occasionally hang on RN when local auth storage is stale / networking is flaky.
		// This makes sure the UI doesn't get stuck on "Sending…".
		const timeoutPromise = new Promise<never>((_, reject) => {
			setTimeout(() => reject(new Error('Request timed out. Please try again.')), RESEND_TIMEOUT_MS);
		});

		const { error } = await Promise.race([resendPromise, timeoutPromise]);

		if (error) {
			const message = error.message ?? '';
			if (isInvalidRefreshTokenError(error)) {
				// Clear stale session storage so future auth actions behave normally.
				await supabase.auth.signOut({ scope: 'local' });
				throw new Error('Session expired. Please log in again.');
			}
			if (/email rate limit exceeded|over_email_send_rate_limit/i.test(message)) {
				throw new Error('Too many email requests. Please wait about a minute, then try again.');
			}
			throw new Error(message);
		}
	}

	async function signInWithGoogle() {
		try {
			// Native Google Sign-In: no browser, no redirect URLs, no proxy. Uses native SDK
			// and Supabase signInWithIdToken. Works on iOS and Android.
			if (Platform.OS === 'ios' || Platform.OS === 'android') {
				const { GoogleSignin, statusCodes } = require('@react-native-google-signin/google-signin');
				const googleAuth = Constants.expoConfig?.extra?.googleAuth as
					| { webClientId?: string; iosClientId?: string }
					| undefined;
				const webClientId = googleAuth?.webClientId;
				if (!webClientId) {
					throw new Error(
						'Google Web Client ID is not configured. Add webClientId to app.json → extra.googleAuth. ' +
						'Create a Web application OAuth client in Google Cloud Console and use that Client ID.'
					);
				}
				const iosClientId = googleAuth?.iosClientId;
				if (Platform.OS === 'ios') {
					if (!iosClientId) {
						throw new Error(
							'Google iOS Client ID is not configured. Add iosClientId to app.json → extra.googleAuth ' +
							'(OAuth client type iOS in Google Cloud Console, bundle ID com.elidzstp.app), then rebuild.'
						);
					}
					GoogleSignin.configure({ webClientId, iosClientId });
				} else {
					GoogleSignin.configure({ webClientId });
				}

				await GoogleSignin.hasPlayServices()
					.catch(() => { throw new Error('Google Play Services not available.'); });

				// Sign out first to force the account picker to show (otherwise cached account may be used silently)
				await GoogleSignin.signOut();

				const response = await GoogleSignin.signIn();
				const isSuccessResponse = (r: typeof response): r is { data: { idToken: string } } =>
					r?.data?.idToken != null;

				if (!isSuccessResponse(response)) {
					if (response?.data?.user?.email) {
						// User cancelled account picker
						throw new Error('Google sign-in was cancelled');
					}
					throw new Error('No ID token received from Google');
				}

				const { data, error } = await supabase.auth.signInWithIdToken({
					provider: 'google',
					token: response.data.idToken,
				});

				if (error) {
					if (/provider is not enabled|unsupported provider/i.test(error.message)) {
						throw new Error(
							'Google sign-in is not enabled in Supabase. Enable Google under Authentication > Providers > Google, then try again.'
						);
					}
					throw new Error(error.message);
				}

				if (data?.session?.user) {
					const { data: statusRow } = await supabase
						.from('profiles')
						.select('verification_status')
						.eq('id', data.session.user.id)
						.maybeSingle();
					if (isAccountSuspended(statusRow)) {
						await supabase.auth.signOut();
						throw new Error(ACCOUNT_SUSPENDED_MESSAGE);
					}
					await loadProfile(data.session.user.id);
				}
				return data;
			}

			// Web platform: fall back to OAuth flow
			const { data, error } = await supabase.auth.signInWithOAuth({
				provider: 'google',
				options: {
					redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/oauth-callback` : undefined,
				},
			});
			if (error) throw new Error(error.message);
			if (data?.url && typeof window !== 'undefined') {
				window.location.href = data.url;
			} else {
				throw new Error('No OAuth URL received');
			}
		} catch (error: any) {
			if (Platform.OS === 'ios' || Platform.OS === 'android') {
				try {
					const { statusCodes } = require('@react-native-google-signin/google-signin');
					if (error?.code === statusCodes?.IN_PROGRESS) {
						throw new Error('Sign-in already in progress');
					}
					if (error?.code === statusCodes?.PLAY_SERVICES_NOT_AVAILABLE) {
						throw new Error('Google Play Services not available or outdated');
					}
				} catch (_) { /* statusCodes not available */ }
			}
			console.error('Google sign-in error:', error);
			throw error;
		}
	}

	async function signInWithApple() {
		try {
			// Native Sign in with Apple + Supabase id_token (same pattern as Google). The web OAuth +
			// openAuthSessionAsync flow is fragile on iOS with PKCE and custom URL schemes.
			if (Platform.OS === 'ios') {
				const AppleAuthentication = require('expo-apple-authentication');
				const isAvailable = await AppleAuthentication.isAvailableAsync();
				if (!isAvailable) {
					throw new Error('Sign in with Apple is not available on this device.');
				}

				const credential = await AppleAuthentication.signInAsync({
					requestedScopes: [
						AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
						AppleAuthentication.AppleAuthenticationScope.EMAIL,
					],
				});

				if (!credential.identityToken) {
					throw new Error('Apple did not return an identity token. Try again.');
				}

				const { data, error } = await supabase.auth.signInWithIdToken({
					provider: 'apple',
					token: credential.identityToken,
				});

				if (error) {
					const message = error.message ?? '';
					if (/provider is not enabled|unsupported provider/i.test(message)) {
						throw new Error(
							'Apple sign-in is not enabled in Supabase. Enable Apple under Authentication > Providers > Apple, then try again.'
						);
					}
					throw new Error(message);
				}

				if (data?.session?.user) {
					const { data: statusRow } = await supabase
						.from('profiles')
						.select('verification_status')
						.eq('id', data.session.user.id)
						.maybeSingle();
					if (isAccountSuspended(statusRow)) {
						await supabase.auth.signOut();
						throw new Error(ACCOUNT_SUSPENDED_MESSAGE);
					}
					await loadProfile(data.session.user.id);
				}
				return data;
			}

			// Non-iOS: web OAuth (e.g. Expo web); mobile Android UI does not expose Apple in this app.
			const { data, error } = await supabase.auth.signInWithOAuth({
				provider: 'apple',
				options: {
					redirectTo:
						typeof window !== 'undefined'
							? `${window.location.origin}/oauth-callback`
							: 'elidzstp://oauth-callback',
				},
			});

			if (error) {
				const message = error.message ?? '';
				if (/provider is not enabled|unsupported provider/i.test(message)) {
					throw new Error(
						'Apple sign-in is not enabled in Supabase. Enable Apple under Authentication > Providers > Apple, then try again.'
					);
				}
				throw new Error(error.message);
			}

			if (data?.url && typeof window !== 'undefined') {
				window.location.href = data.url;
			} else {
				throw new Error('Apple sign-in is only supported on iOS in this app.');
			}

			return data;
		} catch (error: any) {
			const code = error?.code as string | undefined;
			if (code === 'ERR_REQUEST_CANCELED' || code === 'ERR_CANCELED') {
				throw new Error('Apple sign-in was cancelled');
			}
			console.error('Apple sign-in error:', error);
			throw error;
		}
	}

	async function logout() {
		const { error } = await supabase.auth.signOut();
		if (error) {
			Sentry.captureException(error);
		}
		setProfile(null);
		setSession(null);
	}

	async function updateProfile(updates: Partial<Profile>) {
		if (!session?.user) return;

		const allowedRoles: Array<Profile['role']> = [
			'Entrepreneur',
			'SMME',
			'Student',
			'Tenant',
		];

		const nextRole: Profile['role'] | undefined =
			updates.role && allowedRoles.includes(updates.role) ? updates.role : undefined;

		// Users should never be able to mark themselves "verified" or "rejected" from the client.
		const nextVerificationStatus =
			updates.verification_status === 'pending' || updates.verification_status === 'unverified'
				? updates.verification_status
				: undefined;

		const { error } = await supabase
			.from('profiles')
			.update({
				name: updates.name,
				email: updates.email,
				address: updates.address,
				organization: updates.organization,
				bio: updates.bio,
				avatar: updates.avatar,
				role: nextRole,
				verification_status: nextVerificationStatus,
			})
			.eq('id', session.user.id);

		if (error) {
			throw new Error(error.message);
		}

		await loadProfile(session.user.id);
	}

	useEffect(() => {
		const fetchSession = async () => {
			setIsLoading(true)

			const {
				data: { session },
				error,
			} = await supabase.auth.getSession()

			if (error) {
				if (isInvalidRefreshTokenError(error)) {
					// Stale local auth storage can trigger this after password changes or old installs.
					// Clear only local session state to avoid noisy errors for unauthenticated users.
					await supabase.auth.signOut({ scope: 'local' });
					setSession(null);
					setIsLoading(false);
					return;
				}
				console.error('Error fetching session:', error)
			}

			setSession(session)
			setIsLoading(false)
		}

		fetchSession()

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			console.log('Auth state changed:', { event, session })
			setSession(session)
			if (event === 'PASSWORD_RECOVERY') {
				router.replace('/(auth)/change-password');
				return;
			}
			if (session?.user) {
				// Check if profile exists, if not create it (for OAuth users).
				// IMPORTANT: Never treat a SELECT error (e.g. RLS) as "missing", otherwise we
				// can accidentally overwrite a real profile (including avatar) on app start.
				const { data: existingProfile, error: existingProfileError } = await supabase
					.from('profiles')
					.select('id')
					.eq('id', session.user.id)
					.maybeSingle();

				if (existingProfileError) {
					// If we cannot verify existence (RLS/network/etc.), skip auto-create.
					console.warn('AuthProvider: could not check profile existence.', {
						code: existingProfileError.code,
						message: existingProfileError.message,
					});
					Sentry.captureException(existingProfileError);
					await loadProfile(session.user.id);
					return;
				}
				
				if (!existingProfile) {
					// Create profile for OAuth user
					const userMetadata = session.user.user_metadata || {};
					const email = session.user.email || '';
					const name = userMetadata.name || userMetadata.full_name || email.split('@')[0] || 'User';

					// Ensure role is one of the allowed values
					const allowedRoles = ['Entrepreneur', 'SMME', 'Student', 'Tenant'];
					const defaultRole = 'Entrepreneur';
					const userRole = userMetadata.role || defaultRole;
					const validRole = allowedRoles.includes(userRole) ? userRole : defaultRole;

					try {
						await supabase
							.from('profiles')
							.insert({
								id: session.user.id,
								name: name,
								email: email.toLowerCase(),
								role: validRole,
								address: userMetadata.address || null,
								organization: userMetadata.organization || null,
								bio: null,
								avatar: 'blue',
							});
					} catch (error) {
						console.error('Error creating OAuth profile:', error);
						// Try using RPC function if direct insert fails
						try {
					await supabase.rpc('create_user_profile', {
						p_user_id: session.user.id,
						p_name: name,
						p_email: email.toLowerCase(),
						p_role: validRole,
						p_address: userMetadata.address || null,
						p_organization: userMetadata.organization || null,
						p_bio: null,
						p_avatar: 'blue',
					});
						} catch (rpcError) {
							console.error('Error creating OAuth profile via RPC:', rpcError);
						}
					}
				}
				
				await loadProfile(session.user.id);
			} else {
				setProfile(null);
			}
		})

		return () => {
			subscription.unsubscribe()
		}
	}, [])

	useEffect(() => {
		const fetchProfile = async () => {
			setIsLoading(true)

			if (session) {
				await loadProfile(session.user.id);
			} else {
				setProfile(null)
			}

			setIsLoading(false)
		}

		fetchProfile()
	}, [session])

	return (
		<AuthContext.Provider
			value={{
				session,
				isLoading,
				profile,
				isLoggedIn: session != null && session != undefined,
				login,
				signup,
				resendSignupConfirmation,
				signInWithGoogle,
				signInWithApple,
				logout,
				updateProfile,
			}}
		>
			{children}
		</AuthContext.Provider>
	)
}
