import { Spacing } from '@/shared/utils/screen/spacing'
import { Button, Host, HStack as NativeHStack, Text as NativeText, Image } from '@expo/ui/swift-ui'
import { padding } from '@expo/ui/swift-ui/modifiers'
import { background } from '@expo/ui/swift-ui/modifiers'
import React from 'react'

export default function CategoryBar() {
  return (
    <Host modifiers={[background('transparent')]}>
      <NativeHStack alignment="top" modifiers={[padding({ top: Spacing.SCALE_20 })]} spacing={5}>
        <Button variant="glass">
          <NativeHStack spacing={5}>
            <NativeText weight="semibold" size={13}>
              Mới nhất
            </NativeText>
            <Image systemName="chevron.down" size={13} />
          </NativeHStack>
        </Button>
        <Button variant="glass">
          <NativeHStack>
            <NativeText weight="semibold" size={13}>
              Sự kiện
            </NativeText>
            <Image systemName="chevron.down" size={13} />
          </NativeHStack>
        </Button>
        <Button variant="glass">
          <NativeHStack spacing={5}>
            <NativeText weight="semibold" size={13}>
              Trang phục mới
            </NativeText>
            <Image systemName="chevron.down" size={13} />
          </NativeHStack>
        </Button>
      </NativeHStack>
    </Host>
  )
}
