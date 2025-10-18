import { Button, ContextMenu, Host, Image } from '@expo/ui/swift-ui'
import * as React from 'react'
import { View } from 'react-native'

const options = [
  {
    title: 'Đánh dấu đã đọc',
    systemImage: 'checkmark.circle',
    type: 'button',
  },
]

type Props = {
  onPress: () => void
}

export default function ContextMenuNotification({ onPress }: Props) {
  const renderOption = (option: any, index: number): React.ReactElement | null => {
    switch (option.type) {
      case 'button':
        return (
          <Button
            key={index}
            systemImage={option.systemImage}
            role={option.destructive ? 'destructive' : undefined}
            onPress={onPress}
          >
            {option.title}
          </Button>
        )

      default:
        return null
    }
  }

  return (
    <Host style={{ width: 150, height: 50 }}>
      <ContextMenu>
        <ContextMenu.Items>
          {options.map((option, index) => renderOption(option, index))}
        </ContextMenu.Items>
        <ContextMenu.Trigger>
          <View>
            <Host style={{ width: 35, height: 35 }}>
              <Image systemName="ellipsis" />
            </Host>
          </View>
        </ContextMenu.Trigger>
      </ContextMenu>
    </Host>
  )
}
