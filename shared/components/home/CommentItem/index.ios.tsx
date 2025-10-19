import { Spacing } from '@/shared/utils/screen/spacing'
import React from 'react'
import { View } from 'react-native'
import HStack from '../../base/HStack'
import { Image } from 'expo-image'
import VStack from '../../base/VStack'
import { default as Text } from '../../base/Typography'
import { formatTimeAgo } from '@/shared/utils/days'
import { Typography } from '@/shared/utils/screen/typography'
import { Props } from './index.type'

export default function CommentItem({ item }: Props) {
  return (
    <View
      style={{
        paddingHorizontal: Spacing.SCALE_15,
        paddingVertical: Spacing.SCALE_15,
        borderRadius: Spacing.SCALE_15,
      }}
    >
      <HStack spacing={Spacing.SCALE_10}>
        <Image
          source={{ uri: item.author_avatar }}
          style={{ width: Spacing.SCALE_30, height: Spacing.SCALE_30, borderRadius: 100 }}
        />
        <VStack spacing={Spacing.SCALE_2}>
          <HStack
            spacing={Spacing.SCALE_5}
            style={{
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: Typography.FONT_SIZE_14, fontWeight: 'bold' }}>
              {item.author_name}
            </Text>
            <Text style={{ fontSize: Typography.FONT_SIZE_12, color: 'gray' }}>
              {formatTimeAgo(item.created_at)}
            </Text>
          </HStack>
          <Text
            style={{
              fontSize: Typography.FONT_SIZE_15,
            }}
          >
            {item?.content}
          </Text>
        </VStack>
      </HStack>
    </View>
  )
}
