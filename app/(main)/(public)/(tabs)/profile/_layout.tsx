import { useAuth } from '@/shared/providers'
import { Button, Host, Image } from '@expo/ui/swift-ui'
import { background } from '@expo/ui/swift-ui/modifiers'
import { isLiquidGlassAvailable } from 'expo-glass-effect'
import { router, Stack } from 'expo-router'
import { useColorScheme, View } from 'react-native'

export default function HomeLayout() {
  const rawTheme = useColorScheme()
  const theme = rawTheme === 'dark' ? 'dark' : 'light'
  const isGlassAvailable = isLiquidGlassAvailable()
  const blurEffect = theme === 'dark' ? 'systemMaterialDark' : 'systemMaterialLight'
  const { user } = useAuth()

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerLargeTitle: true,
          headerTransparent: true,
          headerShown: false,
        }}
      />
      <Stack.Protected guard={!!user}>
        <Stack.Screen
          name="edit"
          options={{
            headerBackButtonDisplayMode: 'minimal',
            headerTransparent: true,
          }}
        />
      </Stack.Protected>
    </Stack>
  )
}
