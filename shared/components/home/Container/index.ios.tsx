import React from 'react'
import { Props } from './index.type'
import { Platform } from 'react-native'
import { Edge, SafeAreaView } from 'react-native-safe-area-context'

export default function Container({ children }: Props) {
  const safeAreaEdges = React.useMemo(() => {
    return Platform.select({
      ios: ['left', 'right'],
      android: ['left', 'right', 'bottom'],
      default: ['left', 'right', 'bottom', 'top'],
    })
  }, [])

  return (
    <SafeAreaView className="flex-1 dark:bg-dark" edges={safeAreaEdges as Edge[]}>
      {children}
    </SafeAreaView>
  )
}
