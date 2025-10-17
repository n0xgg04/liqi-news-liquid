import React from 'react'
import { TouchableOpacity, Text, View } from 'react-native'
import { useNotification } from '../../providers'

interface NotificationButtonProps {
  onPress?: () => void
  disabled?: boolean
  style?: any
}

export const NotificationButton: React.FC<NotificationButtonProps> = ({
  onPress,
  disabled = false,
  style,
}) => {
  const { displayLocalNotification, isPermissionGranted, isInitialized } = useNotification()

  const handlePress = async () => {
    if (onPress) {
      onPress()
    }

    if (isPermissionGranted && isInitialized) {
      await displayLocalNotification(
        'Test Notification',
        'This is a test notification from your app!',
        { type: 'test', timestamp: Date.now() }
      )
    }
  }

  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: '#007AFF',
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled || !isPermissionGranted ? 0.6 : 1,
        },
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || !isPermissionGranted}
    >
      <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
        {!isPermissionGranted ? 'Permission Required' : 'Send Test Notification'}
      </Text>
    </TouchableOpacity>
  )
}
