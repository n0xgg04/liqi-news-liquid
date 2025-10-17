import { Stack } from 'expo-router'
import React from 'react'
import { View, Text } from 'react-native'

export default function DiscoverScreen() {
  return (
    <View>
      <Stack.Screen options={{ headerTitle: 'Khám phá' }} />
    </View>
  )
}
