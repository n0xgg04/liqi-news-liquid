import React from 'react'
import { View, ViewProps } from 'react-native'

type Props = ViewProps & {
  spacing?: number
}

export default function HStack({ spacing, ...props }: Props) {
  return <View {...props} style={[props.style, { flexDirection: 'row', gap: spacing }]} />
}
