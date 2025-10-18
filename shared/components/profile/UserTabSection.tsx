import { Spacing } from '@/shared/utils/screen/spacing'
import React, { useState } from 'react'
import { View, useWindowDimensions } from 'react-native'
import { SceneMap, TabBar, TabView } from 'react-native-tab-view'
import UserPosted from './UserPosted'

const renderScene = SceneMap({
  first: () => <UserPosted />,
  second: () => <UserPosted />,
})

const routes = [
  { key: 'first', title: 'Bài đăng' },
  { key: 'second', title: 'Bài luận' },
]

interface UserTabSectionProps {
  isScrollViewAtTop: boolean
}

export default function UserTabSection({ isScrollViewAtTop }: UserTabSectionProps) {
  const [index, setIndex] = useState(0)
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions()

  return (
    <TabView
      style={{
        flex: 1,
        flexGrow: 1,
        height: SCREEN_HEIGHT - Spacing.SCALE_200 - Spacing.SCALE_70,
      }}
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: SCREEN_WIDTH }}
      swipeEnabled={isScrollViewAtTop}
      lazy
      renderTabBar={(props) => {
        return (
          <TabBar
            {...props}
            style={{ backgroundColor: 'transparent' }}
            tabStyle={{ backgroundColor: 'transparent', padding: 0, margin: 0 }}
            activeColor="black"
            inactiveColor="gray"
            indicatorStyle={{
              backgroundColor: 'black',
              width: Spacing.SCALE_50,
              marginLeft: Spacing.SCALE_75,
            }}
          />
        )
      }}
    />
  )
}
