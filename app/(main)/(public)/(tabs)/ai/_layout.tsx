import { useAuth } from '@/shared/providers'
import {
  Button,
  Host,
  HStack as NativeHStack,
  Text,
  VStack as NativeVStack,
  Spacer,
  GlassEffectContainer,
} from '@expo/ui/swift-ui'
import { GlassView, isLiquidGlassAvailable, GlassContainer } from 'expo-glass-effect'
import { router, Stack } from 'expo-router'
import { useColorScheme, View, Text as RNText } from 'react-native'
import { cornerRadius, frame, padding } from '@expo/ui/swift-ui/modifiers'
import HStack from '@/shared/components/base/HStack'
import VStack from '@/shared/components/base/VStack'
import { useHeaderHeight } from '@react-navigation/elements'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Spacing } from '@/shared/utils/screen/spacing'
import { Typography } from '@/shared/utils/screen/typography'

export default function AiLayout() {
  const rawTheme = useColorScheme()
  const theme = rawTheme === 'dark' ? 'dark' : 'light'
  const isGlassAvailable = isLiquidGlassAvailable()
  const blurEffect = theme === 'dark' ? 'systemMaterialDark' : 'systemMaterialLight'
  const { user } = useAuth()
  const { top: TOP_AREA } = useSafeAreaInsets()
  const headerHeight = useHeaderHeight()

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerLargeTitle: false,
          headerTransparent: true,
          headerTintColor: theme === 'dark' ? 'white' : 'black',
          headerLargeStyle: { backgroundColor: 'transparent' },
          headerBlurEffect: isGlassAvailable ? undefined : blurEffect,
          headerTitleAlign: 'left',
          header: () => {
            return (
              <GlassContainer>
                <HStack
                  spacing={Spacing.SCALE_10}
                  style={{
                    paddingTop: TOP_AREA + 10,
                    paddingHorizontal: Spacing.SCALE_20,
                    alignItems: 'center',
                  }}
                >
                  <GlassView
                    style={{
                      paddingHorizontal: Spacing.SCALE_20,
                      paddingVertical: Spacing.SCALE_6,
                      borderRadius: 999,
                      flexGrow: 1,
                    }}
                  >
                    <VStack>
                      <RNText
                        className="font-bold"
                        style={{
                          fontSize: Typography.FONT_SIZE_14,
                        }}
                      >
                        AI hỏi đáp
                      </RNText>
                      <RNText
                        className="text-gray-500"
                        style={{
                          fontSize: Typography.FONT_SIZE_11,
                        }}
                      >
                        1 cuộc trò chuyện
                      </RNText>
                    </VStack>
                  </GlassView>
                  <GlassContainer>
                    <GlassView
                      style={{
                        height: Spacing.SCALE_40,
                        width: Spacing.SCALE_40,
                        borderRadius: 999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    ></GlassView>
                  </GlassContainer>
                </HStack>
              </GlassContainer>
            )
          },
        }}
      />
    </Stack>
  )
}
