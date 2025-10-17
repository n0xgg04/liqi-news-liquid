import HStack from '@/shared/components/base/HStack'
import VStack from '@/shared/components/base/VStack'
import { useAuth } from '@/shared/providers'
import { Button, Form, Host, VStack as NativeVStack } from '@expo/ui/swift-ui'
import { frame } from '@expo/ui/swift-ui/modifiers'
import { router } from 'expo-router'
import React from 'react'
import { Text } from 'react-native'

export default function LoginPage() {
  const { signInWithGoogle, signInWithApple, user } = useAuth()

  console.log('user', user)

  return (
    <VStack className="py-10 px-5">
      <Text className="font-bold text-4xl">Đăng nhập</Text>

      {!user && (
        <Host matchContents>
          <NativeVStack spacing={0}>
            <Button
              onPress={() =>
                signInWithGoogle(() => {
                  router.replace('/profile')
                })
              }
              controlSize="large"
              modifiers={[frame({ width: 400, height: 80 })]}
              variant="glassProminent"
            >
              Đăng nhập với Google
            </Button>
            <Button
              onPress={() =>
                signInWithApple(() => {
                  router.replace('/profile')
                })
              }
              controlSize="large"
              modifiers={[frame({ width: 400, height: 80 })]}
              variant="glass"
            >
              Đăng nhập với Apple
            </Button>
          </NativeVStack>
        </Host>
      )}
    </VStack>
  )
}
