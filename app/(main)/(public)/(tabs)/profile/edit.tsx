import InputSection from '@/shared/components/base/InputSection/index.ios'
import SectionItem from '@/shared/components/base/SectionItem/index.ios'
import { useAuth } from '@/shared/providers'
import {
  Form,
  Host,
  HStack,
  Text,
  Image,
  Button,
  TextField,
  Section,
  Spacer,
} from '@expo/ui/swift-ui'
import { Stack, useRouter } from 'expo-router'
import React, { useRef, useState } from 'react'
import { View, Text as RNText, Alert, Keyboard, TouchableOpacity } from 'react-native'
import { useForm } from 'react-hook-form'
import LoadingActivity from '@/shared/components/base/LoadingActivity'
import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/shared/libs/supabase'
import * as ImagePicker from 'expo-image-picker'
import { Image as ExpoImage } from 'expo-image'
import { cornerRadius, frame } from '@expo/ui/swift-ui/modifiers'

type FormState = {
  name: string
  email: string
  avatar_url: string
}

export default function EditProfile() {
  const router = useRouter()
  const { user } = useAuth()
  const avatarImageRef = useRef<ExpoImage>(null)

  const { setValue, handleSubmit, watch } = useForm<FormState>({
    defaultValues: {
      name: user?.user_metadata?.name || '',
      email: user?.email || '',
      avatar_url: user?.user_metadata?.avatar_url || '',
    },
  })

  const watchedName = watch('name')
  const watchedEmail = watch('email')
  const watchedAvatarUrl = watch('avatar_url')

  const uploadAvatar = async (uri: string, user_id: string) => {
    try {
      console.log('uri', uri)
      const response = await fetch(uri)
      const blob = await response.blob()

      const arrayBuffer = await new Response(blob).arrayBuffer()

      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `avatar.${fileExt}`
      const filePath = `${user_id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatar')
        .upload(filePath, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: true,
        })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatar').getPublicUrl(filePath)

      setValue('avatar_url', publicUrl)
      return publicUrl
    } catch (error) {
      console.error('Upload error:', error)
      throw error
    }
  }

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: FormState) => {
      const updateData: FormState = {
        name: data.name,
        email: data.email,
        avatar_url: data.avatar_url,
      }

      const { error, data: userData } = await supabase.auth.updateUser({
        data: updateData,
      })
      if (!!error) throw error
      return userData
    },
    onSuccess: () => {
      router.back()
    },
    onError: (error) => {
      Alert.alert('Thất bại', error.message)
    },
  })

  const { mutate: uploadAvatarMutation, isPending: isUploadingAvatarMutation } = useMutation({
    mutationFn: async (uri: string) => {
      return await uploadAvatar(uri, user?.id!)
    },
    onSuccess: () => {
      avatarImageRef.current?.reloadAsync()
    },
    onError: (error) => {
      Alert.alert('Thất bại', error.message)
    },
  })

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh')
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        uploadAvatarMutation(result.assets[0].uri)
      }
    } catch (error) {
      console.error('Image picker error:', error)
      Alert.alert('Lỗi', 'Không thể chọn ảnh')
    }
  }

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập camera')
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        uploadAvatarMutation(result.assets[0].uri)
      }
    } catch (error) {
      console.error('Camera error:', error)
      Alert.alert('Lỗi', 'Không thể chụp ảnh')
    }
  }

  const showImagePicker = () => {
    Alert.alert('Chọn ảnh đại diện', 'Bạn muốn chọn ảnh từ đâu?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Thư viện', onPress: pickImage },
      { text: 'Camera', onPress: takePhoto },
    ])
  }

  const onSubmit = handleSubmit((data) => {
    Keyboard.dismiss()
    mutate(data)
  })

  return (
    <View className="flex-1">
      <LoadingActivity isLoading={isPending || isUploadingAvatarMutation} />
      <Stack.Screen
        options={{
          headerTitle: 'Thay đổi thông tin',
          headerLeft: () => (
            <Host style={{ width: 35, height: 35 }}>
              <Image onPress={() => router.back()} systemName="arrow.backward" />
            </Host>
          ),
          headerRight: () => (
            <Host style={{ width: 35, height: 35 }}>
              <Button onPress={onSubmit} systemImage="checkmark" />
            </Host>
          ),
        }}
      />
      <Host style={{ flex: 1 }}>
        <Form>
          <Section title="Thông tin cá nhân">
            <HStack>
              <HStack modifiers={[frame({ width: 80, height: 80 }), cornerRadius(100)]}>
                <ExpoImage
                  ref={avatarImageRef}
                  source={{ uri: watchedAvatarUrl }}
                  style={{ width: 80, height: 80 }}
                  contentFit="fill"
                />
              </HStack>
              <Spacer />
              <Button variant="glassProminent" onPress={showImagePicker}>
                <Text>Chọn ảnh</Text>
              </Button>
            </HStack>
            <InputSection
              label="Tên hiển thị"
              value={watchedName}
              onChangeText={(value) => setValue('name', value)}
              showIcon
              iconName="person.fill"
              background="#FFA500"
              textFieldProps={{
                placeholder: 'Tên của bạn là gì?',
              }}
            />
            <InputSection
              label="Email"
              value={watchedEmail}
              onChangeText={(value) => setValue('email', value)}
              showIcon
              iconName="envelope.fill"
              background="#A259FF"
              textFieldProps={{
                placeholder: 'example@gmail.com',
              }}
            />
          </Section>
          <Section title="Tài khoản">
            <SectionItem
              icon="person.fill.badge.minus"
              title="Xoá tài khoản"
              background="red"
              onPress={() => {}}
            />
          </Section>
        </Form>
      </Host>
    </View>
  )
}
