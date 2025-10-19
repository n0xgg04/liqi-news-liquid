import { Spacing } from '@/shared/utils/screen/spacing'
import { GlassView } from 'expo-glass-effect'
import React from 'react'
import VStack from '../../base/VStack'
import HStack from '../../base/HStack'
import { Pressable, useColorScheme, Share } from 'react-native'
import { default as Text } from '../../base/Typography'
import { Typography } from '@/shared/utils/screen/typography'
import { Image as ExpoImage } from 'expo-image'

import { formatTimeAgo } from '@/shared/utils/days'
import PostImages from './../PostImages'
import {
  Host,
  Button,
  Text as NativeText,
  Image as NativeImage,
  HStack as NativeHStack,
} from '@expo/ui/swift-ui'
import { frame } from '@expo/ui/swift-ui/modifiers'
import { cn } from '@/shared/utils/tailwindcss'
import { router } from 'expo-router'
import { Props } from './index.type'

export default function PostContent({
  item,
  handleLike,
  handleComment,
  handlePress,
  isFullScreen,
  clickImageBehavior,
}: Props) {
  const theme = useColorScheme()
  const isDark = theme === 'dark'

  const handleShare = async () => {
    if (!item) return
    await Share.share({
      url: 'https://www.google.com',
      title: item?.title,
      message: item?.content.slice(0, 100),
    })
  }

  const handleOpenComment = () => {
    if (!item) return
    router.push(`/posts/${item.post_id}?action=open_comment`)
  }

  return (
    <GlassView
      style={{
        width: '100%',
        minHeight: Spacing.SCALE_200,
        borderRadius: Spacing.SCALE_30,
        position: 'relative',
      }}
    >
      <VStack
        spacing={Spacing.SCALE_10}
        style={{
          flexGrow: 1,
        }}
      >
        <HStack style={{ paddingHorizontal: Spacing.SCALE_15, paddingTop: Spacing.SCALE_15 }}>
          <GlassView
            style={{
              padding: Spacing.SCALE_5,
              paddingRight: Spacing.SCALE_20,
              borderRadius: Spacing.SCALE_20,
              backgroundColor: isDark ? '#38383a' : undefined,
            }}
            isInteractive
          >
            <HStack
              spacing={Spacing.SCALE_15}
              style={{
                alignItems: 'center',
              }}
            >
              <ExpoImage
                source={{
                  uri: item?.avatar,
                }}
                style={{ width: 30, height: 30, borderRadius: 100, overflow: 'hidden' }}
              />
              <VStack spacing={Spacing.SCALE_2}>
                <Text
                  className="font-medium text-md dark:text-t-dark"
                  style={{
                    lineHeight: 13,
                    fontSize: Typography.FONT_SIZE_13,
                  }}
                >
                  {item?.name}
                </Text>
                <Text
                  className="text-gray-500 dark:text-[#9ba1a6]"
                  style={{
                    lineHeight: 12,
                    fontSize: Typography.FONT_SIZE_12,
                  }}
                >
                  {formatTimeAgo(item?.created_at)}
                </Text>
              </VStack>
            </HStack>
          </GlassView>
        </HStack>

        <VStack className="grow">
          <Pressable className="grow" onPress={() => handlePress(item)}>
            <VStack
              style={{ paddingHorizontal: Spacing.SCALE_15 }}
              spacing={isFullScreen ? Spacing.SCALE_10 : undefined}
            >
              <Text
                className={cn(
                  'font-medium text-[18px] dark:text-t-dark',
                  isFullScreen && 'text-[22px]'
                )}
              >
                {item?.title}
              </Text>
              <Text
                className={cn(
                  'text-[14px] text-gray-500 dark:text-gray-400 grow',
                  isFullScreen && 'text-[15.5px]'
                )}
              >
                {item?.content}
              </Text>
            </VStack>
          </Pressable>
          <PostImages
            postId={item?.post_id}
            data={item?.attachments}
            isFullScreen={isFullScreen}
            clickImageBehavior={clickImageBehavior}
          />
        </VStack>

        <HStack
          style={{
            justifyContent: 'space-between',
            paddingHorizontal: Spacing.SCALE_15,
            paddingBottom: Spacing.SCALE_15,
            paddingTop: isFullScreen ? Spacing.SCALE_15 : undefined,
          }}
        >
          <HStack spacing={Spacing.SCALE_2}>
            <Host matchContents>
              <Button
                modifiers={[frame({ height: 35, width: 70 })]}
                variant="glass"
                onPress={() => handleLike(item as PostContent)}
              >
                <NativeHStack spacing={5}>
                  <NativeImage
                    color={item?.is_liked ? 'red' : 'gray'}
                    systemName={item?.is_liked ? 'heart.fill' : 'heart'}
                    size={14}
                  />
                  <NativeText size={14}>{String(item?.like_count ?? '0')}</NativeText>
                </NativeHStack>
              </Button>
            </Host>
            <Host matchContents>
              <Button
                modifiers={[frame({ height: 35, width: 70 })]}
                variant="glass"
                onPress={handleOpenComment}
              >
                <NativeHStack spacing={5}>
                  <NativeImage color="gray" systemName="bubble.left" size={14} />
                  <NativeText size={14}>{String(item?.comment_count ?? '0')}</NativeText>
                </NativeHStack>
              </Button>
            </Host>
          </HStack>
          <Host matchContents>
            <Button
              modifiers={[frame({ height: 35, width: 120 })]}
              variant="glass"
              onPress={handleShare}
            >
              <NativeHStack spacing={5}>
                <NativeImage color="gray" systemName="square.and.arrow.up" size={14} />
                <NativeText size={14}>Chia sẻ</NativeText>
              </NativeHStack>
            </Button>
          </Host>
        </HStack>
      </VStack>
    </GlassView>
  )
}
