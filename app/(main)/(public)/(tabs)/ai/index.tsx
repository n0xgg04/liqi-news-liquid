import HStack from '@/shared/components/base/HStack'
import { GlassView } from 'expo-glass-effect'
import { Stack } from 'expo-router'
import React, { useRef, useState } from 'react'
import {
  View,
  TextInput,
  Pressable,
  Text,
  FlatList,
  useWindowDimensions,
  Dimensions,
  ScrollView,
  ScrollViewProps,
} from 'react-native'
import {
  KeyboardAvoidingView,
  KeyboardAwareScrollView,
  useReanimatedKeyboardAnimation,
} from 'react-native-keyboard-controller'
import Animated, { LinearTransition, useDerivedValue } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AnimatedFlatList, AnimatedGlassView, AnimatedHStack } from '@/shared/components/animated'
import { Spacing } from '@/shared/utils/screen/spacing'
import { Typography } from '@/shared/utils/screen/typography'
import VStack from '@/shared/components/base/VStack'
import { useForm } from 'react-hook-form'
import { Host, Image } from '@expo/ui/swift-ui'
import { frame } from '@expo/ui/swift-ui/modifiers'
import { LegendList, LegendListRef } from '@legendapp/list'
import { FlashListRef, ListRenderItem } from '@shopify/flash-list'

const BOTTOM_BAR_INSET = 40

type IMessage = {
  id: string
  text: string
  createdAt: Date
  user?: {
    id: string
    name: string
  }
}

const userId = '1'

const RenderScrollComponent = React.forwardRef<ScrollView, ScrollViewProps>(function A(props, ref) {
  return <KeyboardAwareScrollView {...props} ref={ref} extraKeyboardSpace={-Spacing.SCALE_112} />
})

export default function AIScreen() {
  const { height: KEYBOARD_HEIGHT } = useReanimatedKeyboardAnimation()
  const { bottom: BOTTOM_HEIGHT } = useSafeAreaInsets()
  const { width: WINDOW_WIDTH } = useWindowDimensions()
  const { width: WIDTH, height: HEIGHT } = Dimensions.get('screen')
  const { handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      message: '',
    },
  })

  const messageListRef = useRef<FlashListRef<unknown>>(null)

  const [messages, setMessages] = useState<IMessage[]>([
    {
      id: '1',
      text: 'Hello, how are you?',
      createdAt: new Date(),
      user: {
        id: userId,
        name: 'John Doe',
      },
    },
    {
      id: '2',
      text: 'Hello, how are you?',
      createdAt: new Date(),
      user: {
        id: userId,
        name: 'John Doe',
      },
    },
    {
      id: '3',
      text: 'Hello, how are you?',
      createdAt: new Date(),
      user: {
        id: userId,
        name: 'John Doe',
      },
    },
    {
      id: '4',
      text: 'Hello, how are you?',
      createdAt: new Date(),
      user: {
        id: userId,
        name: 'John Doe',
      },
    },
  ])

  const ACTUAL_OFFSET = useDerivedValue(() => {
    if (Math.abs(KEYBOARD_HEIGHT.value) > 0)
      return KEYBOARD_HEIGHT.value + BOTTOM_HEIGHT + BOTTOM_BAR_INSET + Spacing.SCALE_15
    return 0
  })

  const LIST_PADDING_KEYBOARD_SHOW = useDerivedValue(() => {
    if (Math.abs(KEYBOARD_HEIGHT.value) > 0)
      return BOTTOM_BAR_INSET + BOTTOM_HEIGHT + Spacing.SCALE_100
    return BOTTOM_BAR_INSET + BOTTOM_HEIGHT + Spacing.SCALE_100
  })

  const handleSendMessage = handleSubmit((data) => {
    setMessages((prev) => [
      ...prev,
      {
        id: (prev.length + 1).toString(),
        text: data.message,
        createdAt: new Date(),
        user: {
          id: userId,
          name: 'John Doe',
        },
      },
    ])
    setValue('message', '')
    messageListRef.current?.scrollToEnd()
  })

  const renderItem: ListRenderItem<IMessage> = ({ item }) => {
    return (
      <VStack
        spacing={Spacing.SCALE_5}
        style={{ flexGrow: 0, flexShrink: 1, width: 'auto', backgroundColor: 'transparent' }}
      >
        <HStack spacing={Spacing.SCALE_5}>
          <Text style={{ fontSize: Typography.FONT_SIZE_12 }}>Nox Copilot</Text>
          <Text style={{ fontSize: Typography.FONT_SIZE_12 }} className="text-gray-500">
            12:00
          </Text>
        </HStack>
        <GlassView
          style={{
            paddingVertical: Spacing.SCALE_12,
            paddingHorizontal: Spacing.SCALE_16,
            borderRadius: 10,
            maxWidth: WINDOW_WIDTH * 0.8,
            flexGrow: 0,
            flexShrink: 1,
            width: 'auto',
          }}
          isInteractive
        >
          <Text style={{ fontSize: Typography.FONT_SIZE_16 }}>{(item as IMessage).text}</Text>
        </GlassView>
      </VStack>
    )
  }

  return (
    <Animated.View className="flex-1">
      <Stack.Screen options={{ headerTitle: 'AI' }} />
      <AnimatedFlatList
        renderScrollComponent={RenderScrollComponent}
        ref={messageListRef}
        contentContainerStyle={{
          paddingBottom: BOTTOM_BAR_INSET + BOTTOM_HEIGHT + Spacing.SCALE_100,
          marginTop: Spacing.SCALE_50 + Spacing.SCALE_30,
          paddingHorizontal: Spacing.SCALE_20,
          paddingTop: Spacing.SCALE_50,
        }}
        initialScrollIndex={messages.length - 1}
        style={{
          height: HEIGHT,
          width: WIDTH,
        }}
        data={messages}
        renderItem={renderItem as ListRenderItem<unknown>}
        keyExtractor={(item) => (item as IMessage).id}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.SCALE_20 }} />}
      />

      <AnimatedHStack
        className="absolute left-0 right-0  h-20 w-full px-5"
        style={{
          bottom: BOTTOM_HEIGHT + BOTTOM_BAR_INSET,
          transform: [{ translateY: ACTUAL_OFFSET }],
        }}
      >
        <AnimatedGlassView
          style={{
            width: '100%',
            height: Spacing.SCALE_40,
            borderRadius: 999,
            position: 'relative',
          }}
          isInteractive={false}
        >
          <HStack className="w-full h-full items-center">
            <TextInput
              value={watch('message')}
              className="px-5 text-[15px] grow "
              placeholder="Hỏi gì đó đi..."
              onChangeText={(text) => setValue('message', text)}
            />
            <Pressable onPress={handleSendMessage} className="w-11 h-11 absolute right-1">
              <GlassView
                style={{
                  flex: 1,
                  borderRadius: 999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                isInteractive
              >
                <Host matchContents>
                  <Image
                    modifiers={[frame({ width: 15, height: 15 })]}
                    systemName="paperplane.fill"
                  />
                </Host>
              </GlassView>
            </Pressable>
          </HStack>
        </AnimatedGlassView>
      </AnimatedHStack>
    </Animated.View>
  )
}
