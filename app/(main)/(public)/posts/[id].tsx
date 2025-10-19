import PostContent from '@/shared/components/home/PostContent'
import PostSkeleton from '@/shared/components/home/PostSkeleton'
import { KEYS } from '@/shared/constants/query-keys'
import { supabase } from '@/shared/libs/supabase'
import useLikePost from '@/shared/queries/useLikePost'
import { Spacing } from '@/shared/utils/screen/spacing'
import { useHeaderHeight } from '@react-navigation/elements'
import { AnimatedFlashList } from '@shopify/flash-list'
import { useQuery } from '@tanstack/react-query'
import { GlassView } from 'expo-glass-effect'
import { Stack, useLocalSearchParams } from 'expo-router'
import React, { useLayoutEffect, useRef } from 'react'
import {
  ListRenderItem,
  ScrollView,
  ScrollViewProps,
  useWindowDimensions,
  View,
} from 'react-native'
import { default as Text } from '@/shared/components/base/Typography'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import CommentItem from '@/shared/components/home/CommentItem'
import CommentInput from '@/shared/components/home/CommentInput'

type PostDetailProps = {
  id: string
  action?: 'open_comment'
}

const MAX_COMMENTS_PER_PAGE = 20
type GetCommentsReturn = Database['public']['Functions']['get_comments']['Returns'][number]

export default function PostDetail() {
  const { id, action } = useLocalSearchParams<PostDetailProps>()
  const TOP_HEIGHT = useHeaderHeight()
  const { height: MAX_HEIGHT } = useWindowDimensions()
  const commentSectionRef = useRef<View>(null)
  const scrollViewRef = useRef<ScrollView>(null)

  const { data: postContentData, isLoading: isLoadingPostContent } = useQuery({
    queryKey: [KEYS.POST_DETAIL, id, 'content'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-post-content', {
        body: { post_id: id },
      })
      if (error) throw error
      return data.data
    },
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  })

  const { data: postLikesData, isLoading: isLoadingPostLikes } = useQuery({
    queryKey: [KEYS.POST_DETAIL, id, 'likes'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-post-likes', {
        body: { post_id: id },
      })
      if (error) throw error
      return data.data
    },
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  })

  const { data: postCommentsData, isLoading: isLoadingPostComments } = useQuery({
    queryKey: [KEYS.POST_DETAIL, id, 'comments'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-post-comments', {
        body: { post_id: id },
      })
      if (error) throw error
      return data.data
    },
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  })

  const { data: postUserStatusData, isLoading: isLoadingPostUserStatus } = useQuery({
    queryKey: [KEYS.POST_DETAIL, id, 'user_status'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-post-user-status', {
        body: { post_id: id },
      })
      if (error) throw error
      return data.data
    },
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  })

  const postData = React.useMemo(() => {
    if (!postContentData || !postLikesData || !postCommentsData || !postUserStatusData) return null

    return {
      ...postContentData,
      ...postLikesData,
      ...postCommentsData,
      ...postUserStatusData,
    } as PostContent
  }, [postContentData, postLikesData, postCommentsData, postUserStatusData])

  const isLoadingPostDetail =
    isLoadingPostContent || isLoadingPostLikes || isLoadingPostComments || isLoadingPostUserStatus

  const { isLoading: isLoadingComments, data: commentsData = [] } = useQuery({
    queryKey: [KEYS.POST_DETAIL, id, 'comments'],
    queryFn: async () => {
      const { data } = await supabase
        .rpc('get_comments', {
          p_post_id: id,
          p_page: 0,
          p_per_page: MAX_COMMENTS_PER_PAGE,
        })
        .select()
      console.log('comment', data)
      return data || []
    },
    staleTime: 0,
    enabled: !!id,
  })

  const { mutateAsync: likePostMutation } = useLikePost()

  const handleOnEndComment = React.useCallback(() => {
    // Simplified - no infinite loading for now
  }, [])

  const RenderScrollComponent = React.forwardRef<ScrollView, ScrollViewProps>(
    function A(props, ref) {
      return (
        <KeyboardAwareScrollView {...props} ref={ref} extraKeyboardSpace={-Spacing.SCALE_112} />
      )
    }
  )

  const onRenderComment: ListRenderItem<GetCommentsReturn> = ({ item, index }) => {
    return <CommentItem item={item} />
  }

  useLayoutEffect(() => {
    if (action === 'open_comment') {
      commentSectionRef.current?.measure((_____, y, _, __, ___, ____) => {
        scrollViewRef.current?.scrollTo({ y: y + MAX_HEIGHT * 0.7, animated: true })
      })
    }
  }, [action, MAX_HEIGHT])

  return (
    <>
      <ScrollView
        className="bg-white"
        style={{
          paddingTop: TOP_HEIGHT,
          paddingHorizontal: Spacing.SCALE_10,
        }}
        ref={scrollViewRef}
      >
        <Stack.Screen
          options={{
            headerTitle: postData?.title ?? 'Loading...',
            headerShown: true,
            headerTransparent: true,
          }}
        />

        {isLoadingPostDetail ? (
          <PostSkeleton height={MAX_HEIGHT * 0.5} />
        ) : (
          <PostContent
            item={postData as PostContent}
            handleLike={likePostMutation}
            handleComment={() => {}}
            handlePress={() => {}}
            isFullScreen
            clickImageBehavior="openGallery"
          />
        )}

        <View style={{ padding: Spacing.SCALE_10, paddingBottom: Spacing.SCALE_200 }}>
          <Text ref={commentSectionRef as any} className="text-xl font-medium mb-3">
            Bình luận
          </Text>
          <CommentList
            commentsData={commentsData}
            onRenderComment={onRenderComment}
            handleOnEndComment={handleOnEndComment}
            RenderScrollComponent={RenderScrollComponent}
          />
        </View>
      </ScrollView>
      <CommentInput id={id as string} />
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
    <GlassView
      style={{
        borderRadius: Spacing.SCALE_15,
        overflow: 'hidden',
      }}
    >
      <AnimatedFlashList
        style={{
          backgroundColor: 'white',
        }}
        data={commentsData}
        renderItem={onRenderComment as any}
        showsVerticalScrollIndicator={false}
        onEndReached={handleOnEndComment}
        onEndReachedThreshold={0.15}
        renderScrollComponent={RenderScrollComponent}
      />
    </GlassView>
  )
})
