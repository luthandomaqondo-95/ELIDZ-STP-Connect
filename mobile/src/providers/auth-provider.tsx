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

			console.log(' ---- data', data);
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
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			throw new Error(error.message);
		}

		if (data?.user) {
			await loadProfile(data.user.id);
		}
	}

	async function signup(name: string, email: string, password: string, role: Profile['role']) {
		const { data: authData, error: authError } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					name,
					role,
				}
			}
		});

		if (authError) {
			throw new Error(authError.message);
		}

		if (!authData?.user) {
			throw new Error('Failed to create user account');
		}

		await new Promise(resolve => setTimeout(resolve, 1000));
		await loadProfile(authData.user.id);
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
		} = supabase.auth.onAuthStateChange((_event, session) => {
			console.log('Auth state changed:', { event: _event, session })
			setSession(session)
			if (session?.user) {
				loadProfile(session.user.id);
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
				isLoggedIn: session != undefined,
				login,
				signup,
				logout,
				updateProfile,
			}}
		>
			{children}
		</AuthContext.Provider>
	)
}
