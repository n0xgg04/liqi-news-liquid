import HStack from '@/shared/components/base/HStack'
import { Stack, useFocusEffect } from 'expo-router'
import React, { useRef, useState } from 'react'
import { View, Text, ScrollView, useWindowDimensions, StyleSheet } from 'react-native'

import { Spacing } from '@/shared/utils/screen/spacing'
import VStack from '@/shared/components/base/VStack'
import ItemCard from '@/shared/components/discover/ItemCard'
import { FlashList } from '@shopify/flash-list'

const MENUS = [
  {
    imageUrl:
      'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/lien_quan_mobile_tier_list_2025_0_72008389f9.png',
    title: 'Bảng xếp hạng',
    description: 'Bảng xếp hạng tướng các khu vực',
    screen: '/ranking',
  },
  {
    imageUrl: 'https://pub-35418b80b2984caab07674dc41e13989.r2.dev/skin.png',
    title: 'Khám phá Tướng',
    description: 'Cốt truyện, mọi thông tin về tướng',
    screen: '/heroes',
  },
  {
    imageUrl:
      'https://pub-35418b80b2984caab07674dc41e13989.r2.dev/Screenshot%202025-10-17%20at%208.09.08%E2%80%AFPM.png',
    title: 'Hoạt hoạ',
    description: 'Avatar siu cuteee',
    screen: '/avatar',
  },
  {
    imageUrl: 'https://pub-35418b80b2984caab07674dc41e13989.r2.dev/emo.png',
    title: 'Emoji',
    description: 'Bộ sưu tập Emoji',
    screen: '/emoji',
  },
]

export default function DiscoverScreen() {
  const [key, setKey] = useState(Math.random())
  const isFirstTime = useRef(true)

  useFocusEffect(() => {
    if (isFirstTime.current) {
      setKey(Math.random())
    }
    isFirstTime.current = false
  })

  const renderItem = ({ item, index }: { item: (typeof MENUS)[number]; index: number }) => {
    return (
      <ItemCard
        {...item}
        direction={index % 2 === 0 ? 'left' : 'right'}
        delayTransition={index * 200}
      />
    )
  }

  return (
    <>
      <Stack.Screen options={{ headerTitle: 'Khám phá' }} />
      <FlashList
        key={key}
        data={MENUS}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingHorizontal: Spacing.SCALE_20,
        }}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.SCALE_20 }} />}
      />
    </>
  )
}
