import LoadingActivity from '@/shared/components/base/LoadingActivity'
import SectionItem from '@/shared/components/base/SectionItem/index.ios'
import { useAuth, useNotification } from '@/shared/providers'
import {
  Button,
  Form,
  Host,
  HStack,
  Image as ExpoUIImage,
  Section,
  Text,
  VStack,
  Spacer,
  Switch,
} from '@expo/ui/swift-ui'
import {
  background,
  clipShape,
  cornerRadius,
  foregroundStyle,
  frame,
} from '@expo/ui/swift-ui/modifiers'
import { GlassContainer, GlassView } from 'expo-glass-effect'
import { Image as ExpoImage } from 'expo-image'
import { useRouter } from 'expo-router'
import React, { useRef } from 'react'
import { Alert, View, Text as RNText, ActivityIndicator } from 'react-native'

export default function AppContent() {
  const { user, signInWithApple, signOut, isLoading } = useAuth()
  const router = useRouter()
  const { fcmToken } = useNotification()
  const avatarImageRef = useRef<ExpoImage>(null)

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

  return (
    <View className="flex-1">
      <LoadingActivity isLoading={isLoading} />
      <Host style={{ flex: 1 }}>
        <Form>
          {user && (
            <HStack spacing={20}>
              <HStack modifiers={[frame({ width: 80, height: 80 }), cornerRadius(100)]}>
                <ExpoImage
                  ref={avatarImageRef}
                  source={{ uri: user?.user_metadata.avatar_url }}
                  style={{ width: 80, height: 80 }}
                  contentFit="fill"
                />
              </HStack>
              <VStack alignment="leading">
                <Text size={15} weight="medium">
                  {user?.user_metadata.name || user?.email}
                </Text>
                <Text size={12} color="gray" modifiers={[foregroundStyle('gray')]}>
                  Apple Account
                </Text>
                <Spacer modifiers={[frame({ height: 5 })]} />
                <HStack>
                  <Button controlSize="mini" variant="glass">
                    Thành viên
                  </Button>
                </HStack>
              </VStack>
            </HStack>
          )}
          <Section title="Thông tin">
            <SectionItem
              background="#4F8EF7"
              icon="bell.fill"
              title="Nhận thông báo"
              rightSection={<Switch label="" value={false} />}
              showRightIcon={false}
            />
            {!user ? (
              <Button variant="borderless" onPress={handleLogin}>
                Đăng nhập
              </Button>
            ) : (
              <>
                <SectionItem
                  background="#ffa500"
                  icon="person.fill.badge.plus"
                  title="Thay đổi thông tin"
                  onPress={handleOnClickEditProfile}
                  showRightIcon
                />
                <SectionItem
                  background="red"
                  icon="door.right.hand.open"
                  title="Đăng xuất"
                  onPress={handleClickSignout}
                  destructive
                  showRightIcon={false}
                />
              </>
            )}
          </Section>
        </Form>
      </Host>
    </View>
  )
}
