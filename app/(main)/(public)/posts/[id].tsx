import HStack from '@/shared/components/base/HStack'
import LoadingActivity from '@/shared/components/base/LoadingActivity'
import VStack from '@/shared/components/base/VStack'
import PostContent from '@/shared/components/home/PostContent'
import { KEYS } from '@/shared/constants/query-keys'
import { supabase } from '@/shared/libs/supabase'
import { useAuth } from '@/shared/providers'
import useLikePost from '@/shared/queries/useLikePost'
import { Database, Tables } from '@/shared/types/database.types'
import { formatTimeAgo } from '@/shared/utils/days'
import { Spacing } from '@/shared/utils/screen/spacing'
import { Typography } from '@/shared/utils/screen/typography'
import { useHeaderHeight } from '@react-navigation/elements'
import { AnimatedFlashList, FlashList } from '@shopify/flash-list'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { GlassView } from 'expo-glass-effect'
import { Image as ExpoImage, Image } from 'expo-image'
import { Stack, useLocalSearchParams, useNavigation } from 'expo-router'
import React, { useRef } from 'react'
import { useForm } from 'react-hook-form'
import {
  ActivityIndicator,
  Alert,
  ListRenderItem,
  Platform,
  Pressable,
  ScrollView,
  ScrollViewProps,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native'
import {
  KeyboardAwareScrollView,
  useKeyboardAnimation,
  useReanimatedKeyboardAnimation,
} from 'react-native-keyboard-controller'
import Animated, {
  FadeInDown,
  FadeOutDown,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'

type PostDetailProps = {
  id: string
}

const AnimatedGlassView = Animated.createAnimatedComponent(GlassView)
type CreateCommentData = {
  comment: string
}

const MAX_COMMENTS_PER_PAGE = 20
type GetCommentsReturn = Database['public']['Functions']['get_comments']['Returns'][number]

export default function PostDetail() {
  const { id } = useLocalSearchParams<PostDetailProps>()
  const TOP_HEIGHT = useHeaderHeight()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const { height: KEYBOARD_HEIGHT } = useReanimatedKeyboardAnimation()
  const commentInputHeight = useSharedValue<number>(Spacing.SCALE_60)
  const { setValue, handleSubmit, watch } = useForm<CreateCommentData>({
    defaultValues: {
      comment: '',
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

  const { data: postData, isLoading: isLoadingPostDetail } = useQuery({
    queryKey: [KEYS.POST_DETAIL, id],
    queryFn: async () => {
      const { error, data } = await supabase.rpc('get_post_by_id', {
        p_post_id: id,
      })
      if (!!error) throw error
      return data
    },
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    select: (data) => data?.[0] as unknown as PostContent,
  })

  const { mutateAsync: createCommentMutation, isPending: isCreatingComment } = useMutation({
    mutationFn: async (payload: CreateCommentData) => {
      if (payload.comment === '') return
      const { error, data } = await supabase.from('comments').insert({
        post_id: id,
        content: payload.comment,
        author: user?.id,
      })

      if (!!error) throw error
      return data
    },
    onSuccess: (data) => {
      setValue('comment', '')
      queryClient.refetchQueries({ queryKey: [KEYS.POST_DETAIL, id, 'comments'] })
    },
    onError: (error) => {
      Alert.alert('Thất bại', error.message)
    },
  })
  const {
    isLoading: isLoadingComments,
    data: commentsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [KEYS.POST_DETAIL, id, 'comments'],
    queryFn: async ({ pageParam = 0 }) => {
      const { data } = await supabase
        .rpc('get_comments', {
          p_post_id: id,
          p_page: pageParam,
          p_per_page: MAX_COMMENTS_PER_PAGE,
        })
        .select()
      return data
    },
    staleTime: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage && lastPage?.length === MAX_COMMENTS_PER_PAGE) {
        return (allPages?.length ?? 0) + 1
      }
      return undefined
    },
    initialPageParam: 0,
    select(data) {
      return data?.pages.flatMap((page) => page ?? [])
    },
    enabled: !!postData,
  })

  const { mutateAsync: likePostMutation } = useLikePost()
  const { width: WINDOW_WIDTH } = useWindowDimensions()

  const handleSendComment = () => {
    handleSubmit((data) => createCommentMutation(data))()
  }

  const handleOnEndComment = React.useCallback(() => {
    console.log('End comment')
    if (hasNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, fetchNextPage])

  const RenderScrollComponent = React.forwardRef<ScrollView, ScrollViewProps>(
    function A(props, ref) {
      return (
        <KeyboardAwareScrollView {...props} ref={ref} extraKeyboardSpace={-Spacing.SCALE_112} />
      )
    }
  )

  const onRenderComment: ListRenderItem<GetCommentsReturn> = ({ item, index }) => {
    return (
      <AnimatedGlassView
        style={{
          paddingHorizontal: Spacing.SCALE_15,
          paddingVertical: Spacing.SCALE_15,
          borderRadius: Spacing.SCALE_10,
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
              {item.content}
            </Text>
          </VStack>
        </HStack>
      </AnimatedGlassView>
    )
  }

  return (
    <>
      <ScrollView
        className="bg-white"
        style={{
          paddingTop: TOP_HEIGHT,
          paddingHorizontal: Spacing.SCALE_10,
        }}
      >
        <Stack.Screen
          options={{
            headerTitle: postData?.title,
            headerShown: true,
            headerTransparent: true,
          }}
        />

        <LoadingActivity isLoading={isLoadingPostDetail} />

        <PostContent
          item={postData as PostContent}
          handleLike={likePostMutation}
          handleComment={() => {}}
          handlePress={() => {}}
          isFullScreen
        />

        <View style={{ padding: Spacing.SCALE_10, paddingBottom: Spacing.SCALE_200 }}>
          <Text className="text-xl font-medium mb-3">Bình luận</Text>
          <CommentList
            commentsData={commentsData!}
            onRenderComment={onRenderComment}
            handleOnEndComment={handleOnEndComment}
            RenderScrollComponent={RenderScrollComponent}
          />
        </View>
      </ScrollView>
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
    </>
  )
}

type CommentListProps = {
  commentsData: GetCommentsReturn[]
  onRenderComment: ListRenderItem<GetCommentsReturn>
  handleOnEndComment: () => void
  RenderScrollComponent: React.ForwardRefExoticComponent<
    React.PropsWithoutRef<ScrollViewProps> & React.RefAttributes<ScrollView>
  >
}

const CommentList = React.memo(function A({
  commentsData,
  onRenderComment,
  handleOnEndComment,
  RenderScrollComponent,
}: CommentListProps) {
  return (
    <AnimatedFlashList
      data={commentsData}
      renderItem={onRenderComment as any}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={{ height: Spacing.SCALE_10 }} />}
      onEndReached={handleOnEndComment}
      onEndReachedThreshold={0.15}
      renderScrollComponent={RenderScrollComponent}
    />
  )
})
