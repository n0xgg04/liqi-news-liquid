import React from 'react'
import VStack from '../../base/VStack'
import { View } from 'react-native'

export default function PostListHeader() {
  return (
    <VStack>
      <View className="w-full h-10"></View>
      <View className="w-full h-[1px] bg-gray-200 dark:bg-[#38383a] mt-[-5] mb-5" />
    </VStack>
  )
}
