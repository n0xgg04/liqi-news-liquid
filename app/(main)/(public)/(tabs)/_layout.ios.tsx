import { useAuth } from '@/shared/providers'
import { useNavigation } from 'expo-router'
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs'
import { useEffect } from 'react'

export default function TabLayout() {
  const { user } = useAuth()

  return (
    <NativeTabs minimizeBehavior="onScrollDown">
      <NativeTabs.Trigger name="home">
        <Label>Bài viết</Label>
        <Icon sf="newspaper.fill" drawable="custom_android_drawable" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="discover">
        <Label>Khám phá</Label>
        <Icon sf="star.circle.fill" drawable="custom_android_drawable" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="notifications">
        <Label>Thông báo</Label>
        <Icon sf="bell.fill" drawable="custom_android_drawable" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Label>Cá nhân</Label>
        <Icon sf="person.fill" drawable="custom_android_drawable" />
      </NativeTabs.Trigger>
      {user && (
        <NativeTabs.Trigger name="ai" role="search">
          <Icon sf="message.and.waveform.fill" drawable="custom_settings_drawable" />
          <Label>AI</Label>
        </NativeTabs.Trigger>
      )}
    </NativeTabs>
  )
}
