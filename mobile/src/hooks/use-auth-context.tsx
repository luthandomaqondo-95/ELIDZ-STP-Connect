import { Session } from '@supabase/supabase-js'
import { createContext, useContext } from 'react'
import { Profile } from '../types'
import { SocialProvider } from '@/services/auth.service'

export type AuthData = {
    session?: Session | null
    profile?: Profile | null
    isLoading: boolean
    isLoggedIn: boolean
    login: (email: string, password: string) => Promise<void>
    signup: (name: string, email: string, password: string, role: Profile['role'], address: string, idNumber?: string) => Promise<void>
    resendSignupConfirmation: (email: string) => Promise<void>
    signInWithGoogle: () => Promise<any>
    signInWithApple: () => Promise<any>
    socialSignIn: (provider: SocialProvider, idToken: string, nonce?: string) => Promise<{ error: Error | null }>
    logout: () => Promise<void>
    updateProfile: (updates: Partial<Profile>) => Promise<void>
}

export const AuthContext = createContext<AuthData>({
    session: undefined,
    profile: undefined,
    isLoading: true,
    isLoggedIn: false,
    login: async () => {},
    signup: async () => {},
    resendSignupConfirmation: async () => {},
    signInWithGoogle: async () => {},
    signInWithApple: async () => {},
    socialSignIn: async () => ({ error: null }),
    logout: async () => {},
    updateProfile: async () => {},
})

export const useAuthContext = () => useContext(AuthContext)
