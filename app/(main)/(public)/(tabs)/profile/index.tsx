import HStack from '@/shared/components/base/HStack'
import { View, Text } from 'react-native'
import VStack from '@/shared/components/base/VStack'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Page() {
  return (
    <SafeAreaView>
      <View>
        <HStack>
          <Text>hihi</Text>
        </HStack>
        <VStack>
          <Text>Profile</Text>
        </VStack>
      </View>
    </SafeAreaView>
  )
}
