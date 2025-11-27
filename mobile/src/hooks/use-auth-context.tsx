import { Session } from '@supabase/supabase-js'
import { createContext, useContext } from 'react'
import { Profile } from '../types'

export type AuthData = {
    session?: Session | null
    profile?: Profile | null
    isLoading: boolean
    isLoggedIn: boolean
    login: (email: string, password: string) => Promise<void>
    signup: (name: string, email: string, password: string, role: Profile['role'], address: string) => Promise<void>
    signInWithGoogle: () => Promise<any>
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
    signInWithGoogle: async () => {},
    logout: async () => {},
    updateProfile: async () => {},
})

export const useAuthContext = () => useContext(AuthContext)
