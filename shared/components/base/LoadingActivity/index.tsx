import React from 'react'
import { ActivityIndicator, View } from 'react-native'
import type { Props } from './index.d'

export default function LoadingActivity({ isLoading }: Props) {
  return (
    <>
      {isLoading && (
        <View className="flex-1 absolute top-0 left-0 right-0 bottom-0 justify-center items-center z-10">
          <ActivityIndicator size="large" />
        </View>
      )}
    </>
  )
}
