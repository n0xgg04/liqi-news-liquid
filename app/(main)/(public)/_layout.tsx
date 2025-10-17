import { Stack } from 'expo-router'
import React from 'react'

export default function PublicLayout() {
  return (
    <Stack>
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
