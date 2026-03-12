import { AuthContext } from '@/hooks/use-auth-context';
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'
import { PropsWithChildren, useEffect, useState } from 'react'
import { Profile } from '@/types'
import * as Sentry from '@sentry/react-native';

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
			await loadProfile(data.user.id);
		}
	}

	async function signup(name: string, email: string, password: string, role: Profile['role'], address: string) {
		const trimmedName = name.trim();
		const normalizedEmail = email.trim().toLowerCase();
		const normalizedAddress = address.trim();

		const { data: authData, error: authError } = await supabase.auth.signUp({
			email: normalizedEmail,
			password,
			options: {
				emailRedirectTo: 'elidzstp://(auth)/email-confirmed',
				data: {
					name: trimmedName,
					role,
					address: normalizedAddress,
				}
			}
		});

		if (authError) {
			const message = authError.message ?? '';
			if (/email rate limit exceeded|over_email_send_rate_limit/i.test(message)) {
				throw new Error(
					'Too many signup attempts. Please wait about a minute, then try again. If you already signed up, check your email (including spam) for the confirmation link.'
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

		// Create profile regardless of email confirmation status
		const { error: profileError } = await supabase
			.from('profiles')
			.upsert(
				{
					id: userId,
					name: trimmedName,
					email: normalizedEmail,
					role,
					address: normalizedAddress,
				},
				{ onConflict: 'id' }
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

			if (profileError.code === '42501') {
				const { error: rpcError } = await supabase.rpc('create_user_profile', {
					p_user_id: userId,
					p_name: trimmedName,
					p_email: normalizedEmail,
					p_role: role,
					p_address: normalizedAddress,
					p_organization: null,
					p_bio: null,
					p_avatar: 'blue',
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

		const { error } = await supabase.auth.resend({
			type: 'signup',
			email: normalizedEmail,
			options: {
				emailRedirectTo: 'elidzstp://(auth)/email-confirmed',
			},
		});

		if (error) {
			const message = error.message ?? '';
			if (/email rate limit exceeded|over_email_send_rate_limit/i.test(message)) {
				throw new Error('Too many email requests. Please wait about a minute, then try again.');
			}
			throw new Error(message);
		}
	}

	async function signInWithGoogle() {
		try {
			const { data, error } = await supabase.auth.signInWithOAuth({
				provider: 'google',
				options: {
					// Keep a stable deep link even if the screen is removed.
					redirectTo: 'elidzstp://oauth-callback',
					queryParams: {
						access_type: 'offline',
						prompt: 'consent',
					},
				},
			});

			if (error) {
				const message = error.message ?? '';
				if (/provider is not enabled|unsupported provider/i.test(message)) {
					throw new Error(
						'Google sign-in is not enabled in Supabase. Enable Google under Authentication > Providers > Google, then try again.'
					);
				}
				throw new Error(error.message);
			}

			// For React Native/Expo, open the OAuth URL in a browser
			if (data?.url) {
				const WebBrowser = require('expo-web-browser');
				
				// Keep the browser session open for OAuth flow
				WebBrowser.maybeCompleteAuthSession();
				
				const result = await WebBrowser.openAuthSessionAsync(
					data.url,
					'elidzstp://oauth-callback'
				);

				if (result.type === 'success' && result.url) {
					// Parse the callback URL
					const url = new URL(result.url);
					const code = url.searchParams.get('code');
					
					if (code) {
						// Exchange code for session
						const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
						
						if (sessionError) {
							throw new Error(sessionError.message);
						}

						if (sessionData?.session?.user) {
							await loadProfile(sessionData.session.user.id);
						}
					} else {
						throw new Error('No authorization code received from Google');
					}
				} else if (result.type === 'cancel') {
					throw new Error('Google sign-in was cancelled');
				} else {
					throw new Error('Failed to complete Google sign-in');
				}
			} else {
				throw new Error('No OAuth URL received');
			}

			return data;
		} catch (error: any) {
			console.error('Google sign-in error:', error);
			throw error;
		}
	}

	async function signInWithApple() {
		try {
			const { data, error } = await supabase.auth.signInWithOAuth({
				provider: 'apple',
				options: {
					redirectTo: 'elidzstp://oauth-callback',
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

			if (data?.url) {
				const WebBrowser = require('expo-web-browser');
				WebBrowser.maybeCompleteAuthSession();

				const result = await WebBrowser.openAuthSessionAsync(
					data.url,
					'elidzstp://oauth-callback'
				);

				if (result.type === 'success' && result.url) {
					const url = new URL(result.url);
					const code = url.searchParams.get('code');

					if (code) {
						const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

						if (sessionError) {
							throw new Error(sessionError.message);
						}

						if (sessionData?.session?.user) {
							await loadProfile(sessionData.session.user.id);
						}
					} else {
						throw new Error('No authorization code received from Apple');
					}
				} else if (result.type === 'cancel') {
					throw new Error('Apple sign-in was cancelled');
				} else {
					throw new Error('Failed to complete Apple sign-in');
				}
			} else {
				throw new Error('No OAuth URL received');
			}

			return data;
		} catch (error: any) {
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

		const { error } = await supabase
			.from('profiles')
			.update({
				name: updates.name,
				email: updates.email,
				address: updates.address,
				organization: updates.organization,
				bio: updates.bio,
				avatar: updates.avatar,
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
				console.error('Error fetching session:', error)
			}

			setSession(session)
			setIsLoading(false)
		}

		fetchSession()

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (_event, session) => {
			console.log('Auth state changed:', { event: _event, session })
			setSession(session)
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
					const allowedRoles = ['Entrepreneur', 'Researcher', 'SMME', 'Student', 'Investor', 'Tenant'];
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
