import { Spacing } from '@/shared/utils/screen/spacing'
import { FlashList } from '@shopify/flash-list'
import React from 'react'
import { ListRenderItem } from '@shopify/flash-list'
import { Pressable, useWindowDimensions, View } from 'react-native'
import { Image as ExpoImage } from 'expo-image'
import { ImageGallery } from '@georstat/react-native-image-gallery'
import { useRouter } from 'expo-router'

type PostAttachments = {
  attachment_id: number
  created_at: string
  type: string
  url: string
}

const Divider = () => {
  return <View style={{ width: Spacing.SCALE_10, height: Spacing.SCALE_10 }} />
}

type Props = {
  data: PostAttachments[]
  isFullScreen?: boolean
  clickImageBehavior: 'openPost' | 'openGallery'
  postId: string
}

export default function PostImages({ data, isFullScreen, clickImageBehavior, postId }: Props) {
  const { width: SCREEN_WIDTH } = useWindowDimensions()
  const [isOpenGallery, setIsOpenGallery] = React.useState(false)
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const router = useRouter()

  const IMAGE_WIDTH_CALC = SCREEN_WIDTH - Spacing.SCALE_20 * 2 - Spacing.SCALE_15 * 2

  const handleClickImage = (index: number) => {
    if (clickImageBehavior === 'openPost') {
      router.push(`/posts/${postId}`)
    } else {
      setCurrentIndex(index)
      setIsOpenGallery(true)
    }
  }

  const renderAttachments: ListRenderItem<PostAttachments> = ({ index, item }) => {
    return (
      <Pressable onPress={() => handleClickImage(index)}>
        <ExpoImage
          source={{ uri: item.url }}
          style={{
            width: isFullScreen
              ? SCREEN_WIDTH - Spacing.SCALE_10 * 2 - Spacing.SCALE_15 * 2
              : IMAGE_WIDTH_CALC,
            height: Spacing.SCALE_200,
            borderRadius: Spacing.SCALE_20,
            resizeMode: 'contain',
          }}
        />
      </Pressable>
    )
  }

  const images = data?.map((item) => ({ url: item.url }))

  return (
    <>
      <ImageGallery
        hideThumbs
        close={() => setIsOpenGallery(false)}
        isOpen={isOpenGallery}
        images={images}
        resizeMode="contain"
        initialIndex={currentIndex}
      />
      <FlashList
        data={data}
        renderItem={renderAttachments}
        contentContainerStyle={{
          paddingHorizontal: Spacing.SCALE_15,
          paddingTop: Spacing.SCALE_15,
        }}
        horizontal={!isFullScreen}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        snapToInterval={!isFullScreen ? IMAGE_WIDTH_CALC + Spacing.SCALE_10 : undefined}
        decelerationRate="fast"
        keyExtractor={(item) => item.attachment_id.toString()}
        ItemSeparatorComponent={Divider}
      />
    </>
  )
}
