import React from 'react'
import HStack from '../../base/HStack'
import { Host, Image } from '@expo/ui/swift-ui'
import { router } from 'expo-router'

export default function HeaderRight() {
  return (
    <HStack>
      <Host matchContents>
        <Host style={{ width: 35, height: 35 }}>
          <Image
            onPress={() => {
              router.push('/home/create')
            }}
            systemName="plus"
          />
        </Host>
      </Host>
      <Host matchContents>
        <Host style={{ width: 35, height: 35 }}>
          <Image systemName="magnifyingglass" />
        </Host>
      </Host>
    </HStack>
  )
}
