import { Spacing } from '@/shared/utils/screen/spacing'
import React from 'react'
import { GlassView } from 'expo-glass-effect'
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native'
import HStack from '../../base/HStack'
import { Image as ExpoImage } from 'expo-image'
import { useAuth } from '@/shared/providers'
import { Typography } from '@/shared/utils/screen/typography'
import { useForm } from 'react-hook-form'
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller'
import { supabase } from '@/shared/libs/supabase'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { KEYS } from '@/shared/constants/query-keys'
import { CreateCommentData, Props } from './index.type'

const AnimatedGlassView = Animated.createAnimatedComponent(GlassView)

export default function CommentInput({ id }: Props) {
  const { width: WINDOW_WIDTH } = useWindowDimensions()
  const queryClient = useQueryClient()
  const commentInputHeight = useSharedValue<number>(Spacing.SCALE_60)
  const { user } = useAuth()

  const { height: KEYBOARD_HEIGHT } = useReanimatedKeyboardAnimation()

  const { setValue, handleSubmit, watch } = useForm<CreateCommentData>({
    defaultValues: {
      comment: '',
    },
  })

  const { mutateAsync: createCommentMutation, isPending: isCreatingComment } = useMutation({
    mutationFn: async (payload: CreateCommentData) => {
      if (payload.comment === '') return
      const { data, error } = await supabase.functions.invoke('create-comment', {
        body: {
          post_id: id,
          content: payload.comment,
        },
      })
      if (error) throw error
      return data.data
    },
    onSuccess: (data) => {
      setValue('comment', '')
      queryClient.refetchQueries({ queryKey: [KEYS.POST_DETAIL, id, 'comments'] })
      queryClient.refetchQueries({ queryKey: [KEYS.POST_DETAIL, id, 'comments_count'] })
      queryClient.refetchQueries({ queryKey: [KEYS.POST_DETAIL, id, 'user_status'] })
    },
    onError: (error) => {
      Alert.alert('Thất bại', error.message)
    },
  })

  const watchedComment = watch('comment')

  const glassStyleZ = useAnimatedStyle(() => ({
    transform: [
      {
        translateY:
          KEYBOARD_HEIGHT.value < 0 ? KEYBOARD_HEIGHT.value - Spacing.SCALE_10 : -Spacing.SCALE_20,
      },
    ],
    minHeight: commentInputHeight.value,
  }))

  const handleSendComment = () => {
    handleSubmit((data) => createCommentMutation(data))()
  }

  return (
    <AnimatedGlassView
      style={[
        {
          borderRadius: Spacing.SCALE_30,
          position: 'absolute',
          zIndex: 999,
          bottom: 0,
          left: Spacing.SCALE_10,
          right: Spacing.SCALE_10,
          width: WINDOW_WIDTH - Spacing.SCALE_20,
        },
        glassStyleZ,
      ]}
      isInteractive
    >
      <HStack
        style={{
          alignItems: 'center',
        }}
        spacing={Spacing.SCALE_10}
      >
        <View style={{ padding: Spacing.SCALE_10 }}>
          <ExpoImage
            source={{ uri: user?.user_metadata.avatar_url }}
            style={{
              width: Spacing.SCALE_40,
              height: Spacing.SCALE_40,
              borderRadius: 100,
              overflow: 'hidden',
            }}
          />
        </View>
        <TextInput
          value={watchedComment}
          style={{
            flexGrow: 1,
            fontSize: Typography.FONT_SIZE_15,
            textAlignVertical: 'center',
            paddingVertical: Platform.OS === 'ios' ? 20 : 10,
          }}
          onChangeText={(text) => setValue('comment', text)}
          placeholder="Nhập bình luận..."
          editable={!isCreatingComment}
          multiline
          onContentSizeChange={(e) => {
            commentInputHeight.value = e.nativeEvent.contentSize.height
          }}
          spellCheck
        />
        <Pressable onPress={handleSendComment} disabled={isCreatingComment}>
          <GlassView
            style={{
              width: Spacing.SCALE_40,
              height: Spacing.SCALE_40,
              borderRadius: 100,
              margin: Spacing.SCALE_10,
            }}
          >
            {isCreatingComment ? <ActivityIndicator size="small" color="white" /> : null}
          </GlassView>
        </Pressable>
      </HStack>
    </AnimatedGlassView>
  )
}
