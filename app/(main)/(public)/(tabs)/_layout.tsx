import { Link, Tabs } from 'expo-router'
import { useAuth } from '@/shared/providers'
import { COLORS } from '@/shared/constants/colors'
import { BlurView } from 'expo-blur'
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native'
import { default as Text } from '@/shared/components/base/Typography'
import HStack from '@/shared/components/base/HStack'
import VStack from '@/shared/components/base/VStack'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Spacing } from '@/shared/utils/screen/spacing'
import { Typography } from '@/shared/utils/screen/typography'
import HomeIcon from '@/shared/assets/svgs/HomeIcon'
import { fonts } from '@/shared/constants/fonts'
import ProfileIcon from '@/shared/assets/svgs/ProfileIcon'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import StarIcon from '@/shared/assets/svgs/StarIcon'
import Animated, { useSharedValue, withSpring } from 'react-native-reanimated'

const ACCEPTED_TABS = ['home', 'discover', 'notifications', 'profile']
const PADDING_INSET = Spacing.SCALE_2
const MARGIN_INSET = Spacing.SCALE_15

export default function TabLayout() {
  const { user } = useAuth()
  const { width: SCREEN_WIDTH } = useWindowDimensions()
  const { bottom: SAFE_AREA_BOTTOM } = useSafeAreaInsets()
  const activeIndex = useSharedValue(0)

  const tabActiveBtnLeft = useSharedValue(0)

  const TAB_BAR_WIDTH = SCREEN_WIDTH - MARGIN_INSET * 2
  const TAB_WIDTH = TAB_BAR_WIDTH / ACCEPTED_TABS.length

  const tabActiveBtnWidth = useSharedValue(TAB_WIDTH)

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.black,
      }}
      initialRouteName="home"
      tabBar={({ state, navigation, descriptors }) => {
        return (
          <View
            style={{
              position: 'absolute',
              bottom: SAFE_AREA_BOTTOM + Spacing.SCALE_10,
              left: 0,
              right: 0,
              height: Spacing.SCALE_55,
              borderRadius: 999,
              marginHorizontal: MARGIN_INSET,
              overflow: 'hidden',
              borderColor: 'white',
              borderWidth: 1,
            }}
          >
            <BlurView
              style={{
                ...StyleSheet.absoluteFillObject,
              }}
              intensity={90}
              tint="light"
            >
              <HStack
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  width: '100%',
                  padding: PADDING_INSET,
                  position: 'relative',
                }}
                spacing={Spacing.SCALE_1}
              >
                <Animated.View
                  style={[
                    {
                      position: 'absolute',
                      bottom: PADDING_INSET,
                      top: PADDING_INSET,
                      left: PADDING_INSET,
                      width: tabActiveBtnWidth,
                      borderRadius: 999,
                      backgroundColor: '#e8e8e8',
                      opacity: 0.8,
                      transform: [{ translateX: tabActiveBtnLeft }],
                    },
                  ]}
                ></Animated.View>
                {state.routes
                  .filter((route) => ACCEPTED_TABS.includes(route.name))
                  .map((route, index) => {
                    const { options } = descriptors[route.key]
                    const isActive = state.index === index
                    const WIDTH = TAB_BAR_WIDTH / ACCEPTED_TABS.length

                    const label = (
                      options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                          ? options.title
                          : route.name
                    ) as string
                    const tabBarIcon = options.tabBarIcon
                    const activeTint = options.tabBarActiveTintColor
                    const inactiveTint = options.tabBarInactiveTintColor

                    const onPress = () => {
                      const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                      })

                      if (!isActive && !event.defaultPrevented) {
                        activeIndex.value = index
                        tabActiveBtnLeft.value = withSpring(index * TAB_WIDTH, {
                          damping: 50,
                          stiffness: 100,
                          duration: 500 as any,
                        })
                        navigation.navigate(route.name, route.params)
                      }
                    }

                    return (
                      <Pressable
                        onPress={onPress}
                        disabled={isActive}
                        key={index}
                        style={{ width: WIDTH }}
                      >
                        <VStack
                          style={{
                            height: '100%',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexGrow: 1,
                            borderRadius: 999,
                            overflow: 'hidden',
                          }}
                        >
                          {tabBarIcon &&
                            tabBarIcon({
                              focused: isActive,
                              color: isActive ? activeTint! : inactiveTint!,
                              size: Spacing.SCALE_22,
                            })}
                          <Text
                            style={{
                              fontSize: Typography.FONT_SIZE_10,
                              fontFamily: fonts.sfProDisplaySemibold,
                              fontWeight: '700',
                              color: isActive ? activeTint! : inactiveTint!,
                            }}
                          >
                            {label}
                          </Text>
                        </VStack>
                      </Pressable>
                    )
                  })}
              </HStack>
            </BlurView>
          </View>
        )
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Bài viết',
          tabBarIcon: ({ color, size }) => <HomeIcon color={color} width={size} height={size} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Khám phá',
          tabBarIcon: ({ color, size }) => <StarIcon color={color} width={size} height={size} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Thông báo',
          tabBarIcon: ({ color, size }) => <FontAwesome name="bell" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Cá nhân',
          tabBarIcon: ({ color, size }) => <ProfileIcon color={color} width={size} height={size} />,
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI',
        }}
      />
    </Tabs>
  )
}
