import { Spacing } from '@/shared/utils/screen/spacing'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useMemo } from 'react'
import { useWindowDimensions, View, StyleSheet, TouchableOpacity } from 'react-native'
import Animated, { FadeInLeft, FadeInRight } from 'react-native-reanimated'
import { default as Text } from '../base/Typography'
import VStack from '../base/VStack'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { fonts } from '@/shared/constants/fonts'

const AnimatedView = Animated.createAnimatedComponent(View)

type Props = {
  imageUrl: string
  delayTransition?: number
  durationTransition?: number
  damping?: number
  stiffness?: number
  direction: 'left' | 'right'
  title: string
  description: string
  screen: string
}

export default function ItemCard({
  imageUrl,
  delayTransition = 0,
  durationTransition = 1000,
  damping = 200,
  stiffness = 200,
  direction = 'left',
  title,
  description,
  screen,
}: Props) {
  const { width: SCREEN_WIDTH } = useWindowDimensions()

  const animatedEnter = useMemo(() => {
    let AnimationType = FadeInLeft
    if (direction === 'right') {
      AnimationType = FadeInRight
    }

    return AnimationType.damping(damping)
      .springify(stiffness)
      .duration(durationTransition)
      .delay(delayTransition)
  }, [direction, damping, stiffness, durationTransition, delayTransition])

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => {
        router.push(`/discover/${screen}` as any)
      }}
    >
      <AnimatedView
        entering={animatedEnter}
        style={{
          width: SCREEN_WIDTH - Spacing.SCALE_20 * 2,
          height: Spacing.SCALE_120,
          position: 'relative',
        }}
      >
        <LinearGradient
          colors={['#FFFFFF', '#000000']}
          style={{
            borderRadius: Spacing.SCALE_10,
            overflow: 'hidden',
            zIndex: 999,
            ...StyleSheet.absoluteFillObject,
            opacity: 0.5,
          }}
        />
        <VStack
          style={{
            position: 'absolute',
            zIndex: 1000,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'flex-end',
            padding: Spacing.SCALE_10,
          }}
        >
          <Text
            className="text-white text-3xl shadow-xl"
            style={{
              fontFamily: fonts.sfProDisplayBold,
              fontWeight: 'normal',
            }}
          >
            {title}
          </Text>
          <Text
            className="text-white text-xl shadow-xl"
            style={{
              fontFamily: fonts.sfProDisplayRegular,
              fontWeight: 'normal',
            }}
          >
            {description}
          </Text>
        </VStack>
        <Image
          source={{
            uri: imageUrl,
          }}
          style={{
            resizeMode: 'cover',
            width: '100%',
            height: '100%',
            borderRadius: Spacing.SCALE_10,
          }}
        />
      </AnimatedView>
    </TouchableOpacity>
  )
}
