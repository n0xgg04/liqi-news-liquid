import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import { supabase } from '../libs/supabase'
import { useAuthStore } from '../stores/auth-store'
import { User, Session } from '@supabase/supabase-js'
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin'
import * as Crypto from 'expo-crypto'
import { digestStringAsync, CryptoDigestAlgorithm } from 'expo-crypto'
import * as AppleAuthentication from 'expo-apple-authentication'
import * as amplitude from '@amplitude/analytics-react-native'

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  signInWithGoogle: (onSuccess?: () => void) => Promise<void>
  signInWithApple: (onSuccess?: () => void) => Promise<void>
  signUpWithGoogle: (onSuccess?: () => void) => Promise<void>
  signUpWithApple: (onSuccess?: () => void) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { user, session, isLoading, isAuthenticated, setUser, setSession, setLoading, clearAuth } =
    useAuthStore()

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    })
  }, [])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [setUser, setSession, setLoading])

  const signInWithGoogle = async (onSuccess?: () => void) => {
    try {
      setLoading(true)
      await GoogleSignin.hasPlayServices()
      const userInfo = await GoogleSignin.signIn()

      if (userInfo.data?.idToken) {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: userInfo.data.idToken,
        })

        if (error) throw error
        else onSuccess?.()
      } else {
        throw new Error('No ID token present')
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login flow')
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Sign in is in progress already')
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play services not available or outdated')
      } else {
        console.error('Google sign in error:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const signUpWithGoogle = async (onSuccess?: () => void) => {
    await signInWithGoogle(onSuccess)
  }

  const signInWithApple = async (onSuccess?: () => void) => {
    try {
      setLoading(true)

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      })

      if (credential.identityToken) {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        })

        if (error) throw error
        else onSuccess?.()
      } else {
        throw new Error('No identity token received from Apple')
      }
    } catch (error: any) {
      if (error.code === 'ERR_CANCELED') {
        console.log('Apple sign in canceled')
      } else {
        console.error('Apple sign in error:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const signUpWithApple = async (onSuccess?: () => void) => {
    await signInWithApple(onSuccess)
  }

  const signOut = async () => {
    try {
      setLoading(true)

      const { error } = await supabase.auth.signOut()
      if (error) throw error

      try {
        await GoogleSignin.signOut()
      } catch (googleError) {
        console.log('Google sign out error:', googleError)
      }

      clearAuth()
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      amplitude.track('user_signed_out').promise.then(() => {
        amplitude.reset()
      })

      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated,
    signInWithGoogle,
    signInWithApple,
    signUpWithGoogle,
    signUpWithApple,
    signOut,
  }

  useEffect(() => {
    if (user?.id) {
      amplitude.setUserId(user?.id)
      amplitude.track('user_signed_in')
    }
  }, [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
