import { Stack } from 'expo-router'
import React from 'react'

function RootLayout() {
  return (
    <Stack
      initialRouteName="(public)"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(public)" />
      <Stack.Protected guard>
        <Stack.Screen name="(protected)" />
      </Stack.Protected>
    </Stack>
  )
}

export default RootLayout
