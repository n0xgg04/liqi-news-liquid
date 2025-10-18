import HStack from '@/shared/components/base/HStack'
import { default as Text } from '@/shared/components/base/Typography'
import VStack from '@/shared/components/base/VStack'
import { KEYS } from '@/shared/constants/query-keys'
import { supabase } from '@/shared/libs/supabase'
import { formatTimeAgo } from '@/shared/utils/days'
import { Spacing } from '@/shared/utils/screen/spacing'
import { Typography } from '@/shared/utils/screen/typography'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Image } from 'expo-image'
import { Stack } from 'expo-router'
import React from 'react'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, View } from 'react-native'
import { Button, ContextMenu, Host } from '@expo/ui/swift-ui'
import ContextMenuNotification from '@/shared/components/notification/ContextMenu'

interface Notification {
  id: string
  type: string
  title: string
  body: string
  data: {
    post_id?: string
    post_title?: string
    actors?: {
      id: string
      name: string
      avatar?: string
    }[]
    action?: string
  }
  is_read: boolean
  created_at: string
  updated_at: string
}

export default function NotificationsScreen() {
  const queryClient = useQueryClient()

  const {
    data: notificationsData,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: [KEYS.NOTIFICATIONS],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase.functions.invoke('get-notifications', {
        body: { page: pageParam, limit: 20 },
      })
      if (error) throw error
      return data.data
    },
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  })

  const { mutateAsync: markAsReadMutation } = useMutation({
    mutationFn: async (notificationId: string) => {
      const { data, error } = await supabase.functions.invoke('mark-notification-read', {
        body: { notification_id: notificationId },
      })
      if (error) throw error
      return data.data
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: [KEYS.NOTIFICATIONS] })
    },
  })

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await markAsReadMutation(notification.id)
      } catch (error) {
        console.error('Failed to mark notification as read:', error)
      }
    }

    if (notification.data.post_id) {
      // Navigate to post detail
      // router.push(`/posts/${notification.data.post_id}`)
    }
  }

  const renderNotification = ({ item }: { item: Notification }) => (
    <View
      style={{
        backgroundColor: item.is_read ? 'transparent' : '#f0f8ff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
      }}
    >
      <HStack
        spacing={Spacing.SCALE_15}
        style={{
          paddingHorizontal: Spacing.SCALE_15,
          paddingVertical: Spacing.SCALE_15,
          alignItems: 'flex-start',
        }}
      >
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: item.data.actors?.[0]?.avatar || 'https://via.placeholder.com/40' }}
            style={{
              width: Spacing.SCALE_40,
              height: Spacing.SCALE_40,
              borderRadius: 100,
            }}
          />
          {!item.is_read && (
            <View
              style={{
                position: 'absolute',
                top: -2,
                right: -2,
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: '#007AFF',
              }}
            />
          )}
        </View>

        <VStack spacing={Spacing.SCALE_5} style={{ flex: 1 }}>
          <HStack spacing={Spacing.SCALE_5} style={{ alignItems: 'center' }}>
            <Text
              style={{
                fontSize: Typography.FONT_SIZE_15,
                fontWeight: '600',
                color: '#000',
              }}
              numberOfLines={2}
            >
              {item.title}
            </Text>
            {item.data.action === 'like' && <Text style={{ fontSize: 16 }}>❤️</Text>}
            {item.data.action === 'comment' && <Text style={{ fontSize: 16 }}>💬</Text>}
          </HStack>

          <Text
            style={{
              fontSize: Typography.FONT_SIZE_14,
              color: '#666',
            }}
            numberOfLines={2}
          >
            {item.body}
          </Text>

          <Text
            style={{
              fontSize: Typography.FONT_SIZE_12,
              color: '#999',
            }}
          >
            {formatTimeAgo(item.created_at)}
          </Text>
        </VStack>

        <HStack spacing={Spacing.SCALE_10} style={{ alignItems: 'center' }}>
          {item.data.actors && item.data.actors.length > 1 && (
            <VStack spacing={Spacing.SCALE_2}>
              {item.data.actors.slice(1, 4).map((actor, index) => (
                <Image
                  key={actor.id}
                  source={{ uri: actor.avatar || 'https://via.placeholder.com/20' }}
                  style={{
                    width: Spacing.SCALE_20,
                    height: Spacing.SCALE_20,
                    borderRadius: 10,
                  }}
                />
              ))}
              {item.data.actors.length > 4 && (
                <View
                  style={{
                    width: Spacing.SCALE_20,
                    height: Spacing.SCALE_20,
                    borderRadius: 10,
                    backgroundColor: '#ddd',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 10, color: '#666' }}>
                    +{item.data.actors.length - 4}
                  </Text>
                </View>
              )}
            </VStack>
          )}

          <ContextMenu>
            <ContextMenu.Items>
              {!item.is_read && (
                <Button systemImage="checkmark.circle" onPress={() => markAsReadMutation(item.id)}>
                  Đánh dấu đã đọc
                </Button>
              )}
              <Button
                systemImage="trash"
                role="destructive"
                onPress={() => {
                  // TODO: Implement delete notification
                  console.log('Delete notification:', item.id)
                }}
              >
                Xóa thông báo
              </Button>
            </ContextMenu.Items>
            <ContextMenu.Trigger>
              <Pressable
                onPress={() => handleNotificationPress(item)}
                style={{
                  padding: Spacing.SCALE_8,
                  borderRadius: Spacing.SCALE_20,
                }}
              >
                <Host style={{ width: 20, height: 20 }}>
                  <Text style={{ fontSize: 16 }}>⋯</Text>
                </Host>
              </Pressable>
            </ContextMenu.Trigger>
          </ContextMenu>
        </HStack>
      </HStack>
    </View>
  )

  const renderEmptyState = () => (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.SCALE_40,
      }}
    >
      <Text style={{ fontSize: 64, marginBottom: Spacing.SCALE_20 }}>🔔</Text>
      <Text
        style={{
          fontSize: Typography.FONT_SIZE_18,
          fontWeight: '600',
          textAlign: 'center',
          marginBottom: Spacing.SCALE_10,
        }}
      >
        Chưa có thông báo
      </Text>
      <Text
        style={{
          fontSize: Typography.FONT_SIZE_14,
          color: '#666',
          textAlign: 'center',
          lineHeight: 20,
        }}
      >
        Khi có người thích hoặc bình luận bài viết của bạn, thông báo sẽ xuất hiện ở đây.
      </Text>
    </View>
  )

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: Spacing.SCALE_10, color: '#666' }}>Đang tải thông báo...</Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Stack.Screen
        options={{
          headerTitle: 'Thông báo',
          headerRight: () => (
            <Host style={{ width: 35, height: 35 }}>
              <ContextMenuNotification onPress={() => {}} />
            </Host>
          ),
        }}
      />

      {notificationsData?.notifications?.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={notificationsData?.notifications || []}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: Spacing.SCALE_20 }}
        />
      )}
    </View>
  )
}
