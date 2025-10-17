import { InfiniteData, useMutation } from '@tanstack/react-query'
import React from 'react'
import { supabase } from '../libs/supabase'
import { KEYS } from '../constants/query-keys'
import { Alert } from 'react-native'

export default function useLikePost() {
  return useMutation({
    mutationFn: async (item: PostContent) => {
      const { error, data } = await supabase.rpc('toggle_like', {
        p_post_id: item.post_id,
      })
      if (!!error) throw error
      return data as { is_liked: boolean; like_count: number }
    },
    async onMutate(variables, context) {
      await context.client.cancelQueries({ queryKey: [KEYS.NEW_FEED] })
      await context.client.cancelQueries({ queryKey: [KEYS.POST_DETAIL, variables.post_id] })
      const previousData = context.client.getQueryData<InfiniteData<PostContent[]>>([KEYS.NEW_FEED])
      context.client.setQueryData<InfiniteData<PostContent[]>>([KEYS.NEW_FEED], (old) => {
        const pages = old?.pages?.map((page) => {
          return page.map((item) => {
            if (item.post_id === variables.post_id) {
              return {
                ...item,
                is_liked: !item.is_liked,
                like_count: item.is_liked ? item.like_count - 1 : item.like_count + 1,
              }
            }
            return item
          })
        })
        return { ...old, pages: pages ?? [] } as InfiniteData<PostContent[]>
      })
      context.client.setQueryData<PostContent>([KEYS.POST_DETAIL, variables.post_id], (old) => {
        if (!old) return old
        return {
          ...old,
          is_liked: !old.is_liked,
          like_count: old.is_liked ? old.like_count - 1 : (old.like_count ?? 0) + 1,
        }
      })
      return { previousData }
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData<PostContent>([KEYS.POST_DETAIL, variables.post_id], (old) => {
        if (!old) return old
        return {
          ...old,
          is_liked: data.is_liked,
          like_count: data.like_count,
        }
      })

      context.client.setQueryData<InfiniteData<PostContent[]>>([KEYS.NEW_FEED], (old) => {
        const pages = old?.pages?.map((page) => {
          return (
            page.map((item) => {
              if (item.post_id === variables.post_id) {
                return { ...item, is_liked: data.is_liked, like_count: data.like_count }
              }
              return item
            }) ?? []
          )
        })
        return { ...old, pages: pages ?? [] } as InfiniteData<PostContent[]>
      })
    },
    onError: (error, variables, onMutateResult, context) => {
      context.client.setQueryData<InfiniteData<PostContent[]>>(
        [KEYS.NEW_FEED],
        onMutateResult?.previousData
      )
      Alert.alert('Thất bại', error.message)
    },
  })
}
