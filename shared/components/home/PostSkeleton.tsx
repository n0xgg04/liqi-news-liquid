import { Spacing } from '@/shared/utils/screen/spacing'
import { GlassView } from 'expo-glass-effect'
import React, { useEffect } from 'react'
import VStack from '../base/VStack'
import HStack from '../base/HStack'
import { Text, useColorScheme, View } from 'react-native'
import { Typography } from '@/shared/utils/screen/typography'
import Skeleton from 'react-native-reanimated-skeleton'

type PostSkeletonProps = {
  height?: number
}

export default function PostSkeleton({ height = Spacing.SCALE_200 }: PostSkeletonProps) {
  return (
    <Skeleton
      animationType="none"
      isLoading={true}
      layout={[{ width: '100%', height, borderRadius: Spacing.SCALE_30 }]}
    >
      <VStack
        spacing={Spacing.SCALE_10}
        style={{
          flexGrow: 1,
        }}
      >
        <HStack style={{ paddingHorizontal: Spacing.SCALE_15, paddingTop: Spacing.SCALE_15 }}>
          <Skeleton
            animationType="none"
            isLoading={true}
            layout={[
              { width: Spacing.SCALE_30, height: Spacing.SCALE_30, borderRadius: Spacing.SCALE_20 },
            ]}
          >
            <HStack
              spacing={Spacing.SCALE_15}
              style={{
                alignItems: 'center',
              }}
            >
              <View style={{ width: 30, height: 30, borderRadius: 100, overflow: 'hidden' }} />
              <VStack spacing={Spacing.SCALE_2}>
                <Text
                  className="font-medium text-md dark:text-t-dark"
                  style={{
                    lineHeight: 13,
                    fontSize: Typography.FONT_SIZE_13,
                  }}
                >
                  Anonymous
                </Text>
                <Text
                  className="text-gray-500 dark:text-[#9ba1a6]"
                  style={{
                    lineHeight: 12,
                    fontSize: Typography.FONT_SIZE_12,
                  }}
                >
                  Just now
                </Text>
              </VStack>
            </HStack>
          </Skeleton>
        </HStack>
      </VStack>
    </Skeleton>
  )
}
