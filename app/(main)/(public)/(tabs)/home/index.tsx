import { Link, Stack, useRouter } from 'expo-router'
import React from 'react'
import HStack from '@/shared/components/base/HStack'
import { AnimatedFlatList } from '@/shared/components/animated'
import Typography from '@/shared/components/base/Typography'
import { View, RefreshControl, ActivityIndicator, Platform, StatusBar } from 'react-native'
import { Spacing } from '@/shared/utils/screen/spacing'
import VStack from '@/shared/components/base/VStack'
import { ListRenderItem } from '@shopify/flash-list'
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'
import { cn } from '@/shared/utils/tailwindcss'
import PostContent from '@/shared/components/home/PostContent'
import useLikePost from '@/shared/queries/useLikePost'
import PostSkeleton from '@/shared/components/home/PostSkeleton'
import usePosts from '@/shared/queries/usePosts'
import CategoryBar from '@/shared/components/home/CategoryBar'
import HeaderRight from '@/shared/components/home/HeaderRight'
import PostItem from '@/shared/components/home/PostItem'
import PostListHeader from '@/shared/components/home/PostListHeader'
import Container from '@/shared/components/home/Container'

const AnimatedVStack = Animated.createAnimatedComponent(VStack)
const MAX_POST_PER_PAGE = 5

export default function HomeScreen() {
  const router = useRouter()

  const {
    data: newFeedData,
    isLoading: isLoadingFeed,
    isRefetching: isRefetchingFeed,
    refetch: refetchFeed,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePosts({
    maxPostPerPage: MAX_POST_PER_PAGE,
  })

  const { mutateAsync: likePostMutation } = useLikePost()

  const scrollInsets = useSharedValue(0)

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollInsets.value = event.contentOffset.y
  })

  const topBarAnimatedZ = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollInsets.value, [-180, -200], [1, 0], Extrapolation.CLAMP),
    }
  })

  const handleLoadMore = () => {
    if (hasNextPage) {
      fetchNextPage()
    }
  }

  const handleClickPost = (item: PostContent) => {
    router.push(`/posts/${item.post_id}`)
  }

  const renderPosts: ListRenderItem<React.ComponentProps<typeof PostContent>['item']> = ({
    item,
  }) => (
    <PostItem
      item={item}
      handleLike={likePostMutation}
      handleComment={() => {}}
      handlePress={handleClickPost}
    />
  )

  const renderHeader = () => {
    return <PostListHeader />
  }

  const renderSkeletons = () => {
    return <PostSkeleton />
  }

  const renderFooter = () => {
    return (
      <HStack style={{ justifyContent: 'center', alignItems: 'center', padding: Spacing.SCALE_20 }}>
        {isFetchingNextPage ? (
          <ActivityIndicator size="small" />
        ) : (
          <Typography
            className={cn(
              'text-gray-400 dark:text-[#9ba1a6] font-medium mt-5',
              isLoadingFeed && 'hidden'
            )}
          >
            Bạn đã lướt hết bản tin rồi !!
          </Typography>
        )}
      </HStack>
    )
  }

  return (
    <Container>
      <StatusBar translucent barStyle="dark-content" backgroundColor="transparent" />

      <Stack.Screen
        options={{
          headerLargeTitle: true,
          headerTitle: 'Bản tin',
          headerRight: () => <HeaderRight />,
        }}
      />
      <AnimatedVStack
        style={[
          {
            position: 'sticky',
            left: 0,
            right: 0,
            zIndex: 1000,
            paddingHorizontal: Spacing.SCALE_20,
            backgroundColor: 'transparent',
          },
          topBarAnimatedZ,
        ]}
      >
        <CategoryBar />
      </AnimatedVStack>

      {isLoadingFeed ? (
        <AnimatedFlatList
          data={Array.from({ length: MAX_POST_PER_PAGE }).map((_, index) => ({}))}
          renderItem={renderSkeletons as ListRenderItem<unknown>}
          contentContainerStyle={{
            paddingHorizontal: Spacing.SCALE_15,
            paddingTop: Spacing.SCALE_50,
            paddingBottom: Platform.select({
              ios: Spacing.SCALE_20,
              default: Spacing.SCALE_70,
            }),
          }}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.SCALE_10 }} />}
          showsVerticalScrollIndicator={false}
          onScroll={scrollHandler}
          keyboardShouldPersistTaps="never"
        />
      ) : (
        <AnimatedFlatList
          ListHeaderComponent={renderHeader}
          data={newFeedData ?? []}
          contentContainerStyle={{
            paddingHorizontal: Spacing.SCALE_15,
            paddingTop: Spacing.SCALE_5,
            paddingBottom: Platform.select({
              ios: Spacing.SCALE_20,
              default: Spacing.SCALE_70,
            }),
          }}
          keyExtractor={(item) => (item as PostContent).post_id}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderFooter}
          onScroll={scrollHandler}
          scrollEventThrottle={33}
          refreshControl={<RefreshControl refreshing={isRefetchingFeed} onRefresh={refetchFeed} />}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.SCALE_10 }} />}
          renderItem={renderPosts as ListRenderItem<unknown>}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={Platform.select({
            ios: 0.15,
            default: 0.4,
          })}
          keyboardShouldPersistTaps="never"
        />
      )}
    </Container>
  )
}
