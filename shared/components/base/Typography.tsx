import { fonts } from '@/shared/constants/fonts'
import React from 'react'
import { Text, TextProps } from 'react-native'

export default function Typography({ children, style, ...props }: TextProps) {
  return (
    <Text
      {...props}
      style={[
        style,
        {
          fontFamily: fonts.sfProDisplayRegular,
        },
      ]}
    >
      {children}
    </Text>
  )
}
