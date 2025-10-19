import { Stack } from 'expo-router'
import React from 'react'
import { Platform } from 'react-native'

export default function PublicLayout() {
  return (
    <Stack
      screenOptions={Platform.select({
        android: {
          animation: 'slide_from_right',
          animationDuration: 100,
        },
        default: {},
      })}
    >
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        options={{
          presentation: 'pageSheet',
          headerBackButtonDisplayMode: 'minimal',
          headerShown: false,
        }}
        name="auth/login"
      />
      <Stack.Screen options={{ headerBackButtonDisplayMode: 'minimal' }} name="posts/[id]" />
    </Stack>
  )
}
