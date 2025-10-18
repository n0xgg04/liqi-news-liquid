import {
  Host,
  Image,
  HStack as NativeHStack,
  Button,
  Text as NativeText,
  Image as NativeImage,
} from '@expo/ui/swift-ui'
import { Link, Stack, useRouter } from 'expo-router'
import React, { useOptimistic, useState } from 'react'
import HStack from '@/shared/components/base/HStack'
import { AnimatedFlatList } from '@/shared/components/animated'
import Typography from '@/shared/components/base/Typography'
import { View, RefreshControl, ActivityIndicator, StatusBar, Alert } from 'react-native'
import { Spacing } from '@/shared/utils/screen/spacing'
import VStack from '@/shared/components/base/VStack'
import { FlashList, ListRenderItem } from '@shopify/flash-list'
import { background, padding } from '@expo/ui/swift-ui/modifiers'
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'
import { InfiniteData, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { KEYS } from '@/shared/constants/query-keys'
import { supabase } from '@/shared/libs/supabase'
import LoadingActivity from '@/shared/components/base/LoadingActivity'
import { cn } from '@/shared/utils/tailwindcss'
import PostContent from '@/shared/components/home/PostContent'
import { SafeAreaView } from 'react-native-safe-area-context'
import useLikePost from '@/shared/queries/useLikePost'
import PostSkeleton from '@/shared/components/home/PostSkeleton'
import usePosts from '@/shared/queries/usePosts'

const AnimatedVStack = Animated.createAnimatedComponent(VStack)
const MAX_POST_PER_PAGE = 5

export default function HomeScreen() {
  const router = useRouter()

  const {
    data: newFeedData,
    isLoading: isLoadingFeed,
    isError: isErrorFeed,
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
    index,
    item,
  }) => {
    return (
      <Link href={`/posts/${index}`} asChild>
        <Link.Trigger>
          <PostContent
            item={item}
            handleLike={likePostMutation}
            handleComment={() => {}}
            handlePress={handleClickPost}
            clickImageBehavior="openPost"
          />
        </Link.Trigger>
        <Link.Preview style={{ width: 500, height: 500 }} />
        <Link.Menu>
          <Link.MenuAction title="Share" icon="square.and.arrow.up" onPress={() => {}} />
          <Link.MenuAction title="Block" icon="nosign" destructive onPress={() => {}} />
        </Link.Menu>
      </Link>
    )
  }

  const renderHeader = () => {
    return (
      <VStack>
        <View className="w-full h-10"></View>
        <View className="w-full h-[1px] bg-gray-200 dark:bg-[#38383a] mt-[-5] mb-5" />
      </VStack>
    )
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
    <SafeAreaView className="flex-1 dark:bg-dark" edges={['left', 'right']}>
      <Stack.Screen
        options={{
          headerLargeTitle: true,
          headerTitle: 'Bản tin',
          headerRight: () => (
            <HStack>
              <Host matchContents>
                <Host style={{ width: 35, height: 35 }}>
                  <Image
                    onPress={() => {
                      router.push('/home/create')
                    }}
                    systemName="plus"
                  />
                </Host>
              </Host>
              <Host matchContents>
                <Host style={{ width: 35, height: 35 }}>
                  <Image systemName="magnifyingglass" />
                </Host>
              </Host>
            </HStack>
          ),
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
        <Host modifiers={[background('transparent')]}>
          <NativeHStack
            alignment="top"
            modifiers={[padding({ top: Spacing.SCALE_20 })]}
            spacing={5}
          >
            <Button variant="glass">
              <NativeHStack spacing={5}>
                <NativeText weight="semibold" size={13}>
                  Mới nhất
                </NativeText>
                <Image systemName="chevron.down" size={13} />
              </NativeHStack>
            </Button>
            <Button variant="glass">
              <NativeHStack>
                <NativeText weight="semibold" size={13}>
                  Sự kiện
                </NativeText>
                <Image systemName="chevron.down" size={13} />
              </NativeHStack>
            </Button>
            <Button variant="glass">
              <NativeHStack spacing={5}>
                <NativeText weight="semibold" size={13}>
                  Trang phục mới
                </NativeText>
                <Image systemName="chevron.down" size={13} />
              </NativeHStack>
            </Button>
          </NativeHStack>
        </Host>
      </AnimatedVStack>

      {isLoadingFeed ? (
        <AnimatedFlatList
          data={Array.from({ length: MAX_POST_PER_PAGE }).map((_, index) => ({}))}
          renderItem={renderSkeletons as ListRenderItem<unknown>}
          contentContainerStyle={{
            paddingHorizontal: Spacing.SCALE_15,
            paddingTop: Spacing.SCALE_50,
            paddingBottom: Spacing.SCALE_20,
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
            paddingBottom: Spacing.SCALE_20,
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
          onEndReachedThreshold={0.15}
          maintainVisibleContentPosition={{
            autoscrollToTopThreshold: 100,
          }}
          keyboardShouldPersistTaps="never"
        />
      )}
    </SafeAreaView>
  )
}
