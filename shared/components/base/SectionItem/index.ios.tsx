import { HStack, Image as ExpoUIImage, Text, Spacer, Host } from '@expo/ui/swift-ui'
import { background as backgroundModifier, clipShape, frame } from '@expo/ui/swift-ui/modifiers'
import React, { useMemo } from 'react'
import { useColorScheme } from 'react-native'

type Props = Omit<React.ComponentProps<typeof HStack>, 'spacing' | 'children'> & {
  icon: React.ComponentProps<typeof ExpoUIImage>['systemName']
  title: string
  background: Parameters<typeof backgroundModifier>[0]
  onPress?: () => void
  textProps?: Omit<React.ComponentProps<typeof Text>, 'children'>
  destructive?: boolean
  rightSection?: React.ReactNode
  showRightIcon?: boolean
  showRightIconColor?: string
}

export default function SectionItem({
  icon,
  title,
  background,
  onPress,
  textProps,
  destructive,
  rightSection,
  showRightIcon,
  showRightIconColor,
  ...props
}: Props) {
  const theme = useColorScheme()
  const isDark = theme === 'dark'

  const textColor = useMemo(() => {
    if (destructive) {
      return 'red'
    }

    if (isDark) {
      return '#ECEDEE'
    }

    return 'black'
  }, [isDark, destructive])

  return (
    <HStack onPress={onPress} spacing={8} {...props}>
      <HStack spacing={8}>
        <ExpoUIImage
          systemName={icon}
          color={'white'}
          size={18}
          modifiers={[
            frame({ width: 28, height: 28 }),
            backgroundModifier(background),
            clipShape('roundedRectangle'),
          ]}
        />
        <Text color={textColor} {...textProps}>
          {title}
        </Text>
      </HStack>
      <Spacer />
      {rightSection}
      {showRightIcon && <ExpoUIImage systemName="chevron.right" color="gray" size={16} />}
    </HStack>
  )
}
