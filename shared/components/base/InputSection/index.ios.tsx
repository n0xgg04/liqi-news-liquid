import { HStack, TextField, Text, Host, Image } from '@expo/ui/swift-ui'
import { background as backgroundModifier, clipShape, frame } from '@expo/ui/swift-ui/modifiers'
import React from 'react'

type Props = {
  label: string
  value?: string
  onChangeText: (text: string) => void
  isRequired?: boolean
  textFieldProps?: React.ComponentProps<typeof TextField>
  iconName?: React.ComponentProps<typeof Image>['systemName']
  background?: Parameters<typeof backgroundModifier>[0]
  showIcon?: boolean
  spacing?: number
}

export default function InputSection({
  label,
  value,
  onChangeText,
  isRequired,
  textFieldProps,
  iconName,
  background,
  showIcon,
  spacing = 10,
}: Props) {
  return (
    <Host matchContents>
      <HStack spacing={10}>
        {showIcon && iconName && (
          <Image
            systemName={iconName}
            color="white"
            size={18}
            modifiers={[
              frame({ width: 28, height: 28 }),
              backgroundModifier(background ?? 'clear'),
              clipShape('roundedRectangle'),
            ]}
          />
        )}
        <HStack spacing={spacing}>
          <Text>{label}</Text>
          <TextField
            autocorrection={false}
            defaultValue={value}
            onChangeText={onChangeText}
            {...textFieldProps}
          />
        </HStack>
      </HStack>
    </Host>
  )
}
