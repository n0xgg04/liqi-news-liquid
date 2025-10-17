import React from 'react'
import { TouchableOpacity, Text, View } from 'react-native'
import { useAuth } from '../../providers'

interface GoogleSignInButtonProps {
  onPress?: () => void
  disabled?: boolean
  style?: any
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onPress,
  disabled = false,
  style,
}) => {
  const { signInWithGoogle, isLoading } = useAuth()

  const handlePress = async () => {
    if (onPress) {
      onPress()
    }
    await signInWithGoogle()
  }

  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: '#4285F4',
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled || isLoading ? 0.6 : 1,
        },
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || isLoading}
    >
      <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
        {isLoading ? 'Signing in...' : 'Sign in with Google'}
      </Text>
    </TouchableOpacity>
  )
}
