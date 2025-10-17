import HStack from '@/shared/components/base/HStack'
import LoadingActivity from '@/shared/components/base/LoadingActivity'
import VStack from '@/shared/components/base/VStack'
import { KEYS } from '@/shared/constants/query-keys'
import { supabase } from '@/shared/libs/supabase'
import { useAuth } from '@/shared/providers'
import { Spacing } from '@/shared/utils/screen/spacing'
import { Typography } from '@/shared/utils/screen/typography'
import {
  Host,
  Image,
  HStack as NativeHStack,
  VStack as NativeVStack,
  Button as NativeButton,
  Text as NativeText,
  BottomSheet,
} from '@expo/ui/swift-ui'
import { frame } from '@expo/ui/swift-ui/modifiers'
import { useHeaderHeight } from '@react-navigation/elements'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { router, Stack } from 'expo-router'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Alert, Pressable, Text, TextInput, View } from 'react-native'
import { KeyboardAvoidingView } from 'react-native-keyboard-controller'
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import * as ImagePicker from 'expo-image-picker'
import { ImagePickerAsset } from 'expo-image-picker'

const AnimatedHStack = Animated.createAnimatedComponent(HStack)

type IPostData = {
  content: string
  title: string
  images: ImagePickerAsset[]
}
export default function Create() {
  const TOP_HIGHT = useHeaderHeight()
  const { height: keyboardHeight } = useAnimatedKeyboard()
  const { setValue, handleSubmit, watch } = useForm<IPostData>({
    defaultValues: {
      content: '',
      title: '',
      images: [],
    },
  })

  const { user } = useAuth()
  const queryClient = useQueryClient()

  const {
    isPending: isUploading,
    isSuccess: isUploadSuccess,
    mutateAsync: uploadPost,
  } = useMutation({
    mutationFn: async (data: IPostData) => {
      const { error, data: postData } = await supabase
        .from('posts')
        .insert({
          author: user?.id!,
          content: data.title!,
          title: data.content,
        })
        .select()
        .single()

      if (!!error) {
        Alert.alert('Thất bại', error.message)
        throw error
      }

      const photoUpload = data.images.map(async (image) => {
        const response = await fetch(image.uri)
        const blob = await response.blob()
        const arrayBuffer = await new Response(blob).arrayBuffer()
        const fileExt = image.uri.split('.').pop()?.toLowerCase() || 'jpg'
        const fileName = `${image.fileName}`
        const filePath = `${postData?.post_id}/images/${fileName}`

        console.log(filePath)

        const { error: uploadPhotosError, data: uploadPhotosData } = await supabase.storage
          .from('posts')
          .upload(filePath, arrayBuffer, {
            contentType: `image/${fileExt}`,
            upsert: true,
          })

        if (uploadPhotosError) {
          throw uploadPhotosError
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('posts').getPublicUrl(uploadPhotosData.path)

        const { error: mapAttachmentsError, data: mapAttachmentsData } = await supabase
          .from('attachments')
          .insert({
            post_id: postData?.post_id,
            type: 'image',
            url: publicUrl,
          })
          .select()
          .single()

        if (mapAttachmentsError) {
          throw mapAttachmentsError
        }

        return mapAttachmentsData
      })

      const imageUpload = await Promise.all(photoUpload)

      return { postData, imageUpload }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEYS.NEW_FEED] })
      router.back()
    },
    onError: (error) => {
      console.log(error)
      Alert.alert('Thất bại', error.message)
    },
  })

  const toolbarStyleZ = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      bottom: withTiming(keyboardHeight.value + Spacing.SCALE_20, {
        duration: 100,
      }),
      left: Spacing.SCALE_10,
      right: 0,
      zIndex: 99,
      paddingHorizontal: Spacing.SCALE_10,
    }
  })

  const contentValue = watch('content')
  const titleValue = watch('title')
  const imagesValue = watch('images')

  const handleBack = () => {
    router.back()
  }

  const handleUpload = handleSubmit((data) => {
    uploadPost(data)
  })

  const handleAddImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 5,
      presentationStyle: ImagePicker.UIImagePickerPresentationStyle.POPOVER,
    })
    if (result.assets) {
      setValue('images', result.assets)
    }
  }

  const handleAddYouTubeLink = () => {
    console.log('add youtube link')
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Bài viết',
          headerLeft: () => (
            <Pressable onPress={handleBack}>
              <Host matchContents>
                <Host style={{ width: 35, height: 35 }}>
                  <Image systemName="xmark" />
                </Host>
              </Host>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={handleUpload}>
              <Host matchContents>
                <Host style={{ width: 30, height: 35 }}>
                  <Image systemName="checkmark" />
                </Host>
              </Host>
            </Pressable>
          ),
        }}
      />
      <LoadingActivity isLoading={isUploading} />
      <Host style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <BottomSheet isOpened={false} onIsOpenedChange={() => {}}>
          <Text>Hello, world!</Text>
        </BottomSheet>
      </Host>
      <KeyboardAvoidingView>
        <VStack
          style={{
            paddingTop: TOP_HIGHT,
            paddingHorizontal: Spacing.SCALE_20,
          }}
          className="100vw 100vh relative gap-y-2 h-full"
        >
          <AnimatedHStack style={toolbarStyleZ}>
            <Host matchContents>
              <NativeHStack spacing={10}>
                <NativeButton variant="glass" onPress={handleAddImage}>
                  <NativeHStack
                    modifiers={[frame({ width: imagesValue.length > 0 ? 160 : 130, height: 20 })]}
                    spacing={5}
                    alignment="center"
                  >
                    <Image size={15} color="#f00800" systemName="photo.fill" />
                    <NativeText size={14}>
                      {imagesValue.length > 0
                        ? `Đã chọn ${imagesValue.length} hình ảnh`
                        : 'Thêm hình ảnh'}
                    </NativeText>
                  </NativeHStack>
                </NativeButton>
                <NativeButton variant="glass" onPress={handleAddYouTubeLink}>
                  <NativeHStack
                    modifiers={[frame({ width: 130, height: 20 })]}
                    spacing={5}
                    alignment="center"
                  >
                    <Image size={15} color="red" systemName="video.bubble.fill" />
                    <NativeText size={14}>YouTube link</NativeText>
                  </NativeHStack>
                </NativeButton>
              </NativeHStack>
            </Host>
          </AnimatedHStack>
          <TextInput
            defaultValue={contentValue}
            onChangeText={(text) => setValue('content', text)}
            style={{
              fontSize: Typography.FONT_SIZE_24,
            }}
            placeholder="Tiêu đề..."
            className="w-full font-medium"
            multiline
            contextMenuHidden={false}
            editable
          />
          <TextInput
            defaultValue={titleValue}
            onChangeText={(text) => setValue('title', text)}
            style={{
              fontSize: Typography.FONT_SIZE_18,
            }}
            placeholder="Nội dung bài viết..."
            className="w-full grow "
            multiline
          />
        </VStack>
      </KeyboardAvoidingView>
    </>
  )
}
