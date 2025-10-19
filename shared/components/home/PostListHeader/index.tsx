import React from 'react'
import VStack from '../../base/VStack'
import Typography from '../../base/Typography'
import { Spacing } from '@/shared/utils/screen/spacing'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'

export default function PostListHeader() {
  const { top } = useSafeAreaInsets()
  return (
    <>
      <VStack
        className="mb-2"
        style={{
          paddingTop: top + Spacing.SCALE_50,
        }}
      >
        <Typography className="text-gray-700 dark:text-[#9ba1a6] font-bold text-3xl">
          Dành cho bạn
        </Typography>
      </VStack>
    </>
  )
}
