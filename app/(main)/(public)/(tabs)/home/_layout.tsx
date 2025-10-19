import { isLiquidGlassAvailable } from 'expo-glass-effect'
import { Stack } from 'expo-router'
import { Platform, useColorScheme } from 'react-native'

export default function HomeLayout() {
  const rawTheme = useColorScheme()
  const theme = rawTheme === 'dark' ? 'dark' : 'light'
  const isGlassAvailable = isLiquidGlassAvailable()
  const blurEffect = theme === 'dark' ? 'systemMaterialDark' : 'systemMaterialLight'

  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_left',
        headerShown: Platform.select({
          ios: true,
          default: false,
        }),
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerLargeTitle: true,
          headerTransparent: true,
          headerTintColor: theme === 'dark' ? 'white' : 'black',
          headerLargeStyle: { backgroundColor: 'transparent' },
          headerBlurEffect: isGlassAvailable ? undefined : blurEffect,
          animation: 'slide_from_left',
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          presentation: 'pageSheet',
          headerBackButtonDisplayMode: 'minimal',
          headerTransparent: true,
        }}
      />
    </Stack>
  )
}
