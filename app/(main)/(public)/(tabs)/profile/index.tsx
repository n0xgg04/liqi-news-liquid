import LoadingActivity from '@/shared/components/base/LoadingActivity'
import VStack from '@/shared/components/base/VStack'
import { useAuth, useNotification } from '@/shared/providers'
import { Spacing } from '@/shared/utils/screen/spacing'
import { fontWeights, Typography } from '@/shared/utils/screen/typography'
import { GlassView } from 'expo-glass-effect'

import { Image as ExpoImage, Image } from 'expo-image'
import Feather from '@expo/vector-icons/Feather'
import { useRouter } from 'expo-router'
import React, { useRef, useState, useCallback } from 'react'
import {
  Alert,
  View,
  ScrollView,
  Pressable,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native'
import HStack from '@/shared/components/base/HStack'
import { default as RNText } from '@/shared/components/base/Typography'
import { fonts } from '@/shared/constants/fonts'
import UserTabSection from '@/shared/components/profile/UserTabSection'

export default function AppContent() {
  const { user, signInWithGoogle, signOut, isLoading } = useAuth()
  const router = useRouter()
  const { fcmToken } = useNotification()
  const avatarImageRef = useRef<ExpoImage>(null)
  const scrollViewRef = useRef<ScrollView>(null)
  const [isScrollViewAtTop, setIsScrollViewAtTop] = useState(true)

  const handleLogin = () => {
    router.push('/auth/login')
  }

  const handleClickSignout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất không?', [
      {
        text: 'Hủy',
        style: 'cancel',
      },
      { text: 'Đăng xuất', onPress: () => signOut() },
    ])
  }

  const handleOnClickEditProfile = () => {
    router.push('/profile/edit')
  }

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset } = event.nativeEvent
    const isAtTop = contentOffset.y <= 0
    setIsScrollViewAtTop(isAtTop)
  }, [])

  return (
    <View className="flex-1">
      <LoadingActivity isLoading={isLoading} />

      <Image
        source={{
          uri: 'https://pub-35418b80b2984caab07674dc41e13989.r2.dev/562112114_669315439566865_2718629299398845084_n.jpg',
        }}
        style={{
          width: '100%',
          height: Spacing.SCALE_230,
        }}
      />
      <ScrollView
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={false}
        style={{
          minHeight: Spacing.SCALE_300 * 3,
          backgroundColor: 'white',
          position: 'absolute',
          top: Spacing.SCALE_210,
          left: 0,
          right: 0,
          zIndex: 1000,
          borderTopLeftRadius: Spacing.SCALE_30,
          borderTopRightRadius: Spacing.SCALE_30,
          overflow: 'visible',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <VStack
          style={{
            position: 'absolute',
            top: -Spacing.SCALE_30,
            left: Spacing.SCALE_25,
          }}
          spacing={Spacing.SCALE_10}
        >
          <Image
            source={{ uri: user?.user_metadata?.avatar_url }}
            style={{
              width: Spacing.SCALE_65,
              height: Spacing.SCALE_65,
              borderRadius: Spacing.SCALE_100,
            }}
          />
          <VStack>
            <RNText
              style={{
                fontSize: Typography.FONT_SIZE_18,
                fontFamily: fonts.sfProDisplayBold,
                fontWeight: fontWeights.w_600,
              }}
            >
              {user?.user_metadata?.name}
            </RNText>
            <HStack className="mt-1 items-center " spacing={5}>
              <Feather name="mail" size={Spacing.SCALE_14} color="gray" />
              <RNText className="text-gray-700 text-md">{user?.email}</RNText>
            </HStack>
          </VStack>
        </VStack>
        <Pressable
          style={{
            position: 'absolute',
            right: Spacing.SCALE_20,
            top: Spacing.SCALE_10,
          }}
          onPress={handleOnClickEditProfile}
        >
          {user ? (
            <GlassView
              isInteractive
              style={{
                width: Spacing.SCALE_70,
                paddingHorizontal: Spacing.SCALE_5,
                paddingVertical: Spacing.SCALE_8,
                borderRadius: 999,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: Spacing.SCALE_5,
                display: 'flex',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
              }}
            >
              <Feather name="edit-2" size={Spacing.SCALE_14} color="black" />
              <RNText className="text-md font-medium">Sửa</RNText>
            </GlassView>
          ) : (
            <Pressable onPress={signInWithGoogle}>
              <RNText>Đăng nhập</RNText>
            </Pressable>
          )}
        </Pressable>
        <VStack
          style={{
            paddingTop: Spacing.SCALE_100,
            flex: 1,
            flexGrow: 1,
          }}
        >
          <UserTabSection isScrollViewAtTop={isScrollViewAtTop} />
        </VStack>
      </ScrollView>
    </View>
  )
}
