import React from 'react'
import { Props } from './index.type'
import { Edge, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Spacing } from '@/shared/utils/screen/spacing'

export default function Container({ children }: Props) {
  const { bottom } = useSafeAreaInsets()
  const safeAreaEdges = React.useMemo(() => {
    return Platform.select({
      ios: ['left', 'right'],
      android: ['left', 'right', 'bottom'],
      default: ['left', 'right', 'bottom', 'top'],
    })
  }, [])

  return (
    <SafeAreaView className="flex-1 dark:bg-dark bg-[#f2f2f2]" edges={safeAreaEdges as Edge[]}>
      <LinearGradient
        colors={['#fff', 'transparent']}
        style={{
          position: 'absolute',
          zIndex: 999,
          top: 0,
          left: 0,
          right: 0,
          height: Spacing.SCALE_80,
        }}
      ></LinearGradient>
      <LinearGradient
        colors={['transparent', '#fff']}
        style={{
          position: 'absolute',
          zIndex: 999,
          left: 0,
          right: 0,
          bottom: 0,
          height: Spacing.SCALE_80 + bottom,
        }}
      ></LinearGradient>
      {children}
    </SafeAreaView>
  )
}
