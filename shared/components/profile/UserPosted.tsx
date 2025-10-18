import React from 'react'
import { AnimatedFlatList } from '../animated'
import { Spacing } from '@/shared/utils/screen/spacing'
import { ActivityIndicator, View, ListRenderItem } from 'react-native'
import PostContent from '../home/PostContent'
import useMyPosts from '@/shared/queries/useMyPosts'
import Typography from '../base/Typography'
import useLikePost from '@/shared/queries/useLikePost'
import { router } from 'expo-router'

export default function UserPosted() {
  const { data, isLoading } = useMyPosts({
    maxPostPerPage: 10,
  })

  const { mutateAsync: likePost } = useLikePost()

  const handleClickPost = (item: PostContent) => {
    router.push(`/posts/${item.post_id}`)
  }

  const renderPosts: ListRenderItem<any> = ({ item }) => {
    return (
      <PostContent
        item={item}
        handleComment={handleClickPost}
        handleLike={likePost}
        handlePress={handleClickPost}
        isFullScreen={false}
        clickImageBehavior="openPost"
      />
    )
  }

  return (
    <AnimatedFlatList
      data={data}
      contentContainerStyle={{
        paddingHorizontal: Spacing.SCALE_15,
        paddingBottom: Spacing.SCALE_20,
      }}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={{ height: Spacing.SCALE_10 }} />}
      renderItem={renderPosts}
      keyboardShouldPersistTaps="never"
      ListEmptyComponent={() => (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: Spacing.SCALE_50,
          }}
        >
          {isLoading && <ActivityIndicator size="large" />}
          {!isLoading && <Typography className="text-gray-500">Không có bài đăng</Typography>}
        </View>
      )}
    />
  )
}
