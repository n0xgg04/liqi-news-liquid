import { Stack } from 'expo-router'
import React from 'react'
import { Platform } from 'react-native'

function RootLayout() {
  return (
    <Stack
      initialRouteName="(public)"
      screenOptions={Platform.select({
        android: {
          animation: 'slide_from_right',
          animationDuration: 100,
          headerShown: false,
        },
        default: {
          headerShown: false,
        },
      })}
    >
      <Stack.Screen name="(public)" />
      <Stack.Protected guard>
        <Stack.Screen name="(protected)" />
      </Stack.Protected>
    </Stack>
  )
}

export default RootLayout
