import { useInfiniteQuery } from '@tanstack/react-query'
import { KEYS } from '../constants/query-keys'
import { supabase } from '../libs/supabase'

type Props = {
  maxPostPerPage: number
}

interface PostResult {
  post_id: string
  title: string
  content: string
  created_at: string
  author_id: string
  author_name: string
  author_avatar: string
  attachments: Array<{
    attachment_id: string
    url: string
    type: string
    created_at: string
  }>
  like_count: number
  comment_count: number
  is_liked: boolean
  is_commented: boolean
}

export default function useMyPosts({ maxPostPerPage }: Props) {
  return useInfiniteQuery({
    queryKey: [KEYS.MY_POSTS],
    queryFn: async ({ pageParam = 1 }) => {
      const { data, error } = await supabase.functions.invoke('get-my-post', {
        body: {
          page_number: pageParam,
          per_page: maxPostPerPage,
        },
      })

      if (error) {
        throw error
      }

      return data?.data || []
    },
    staleTime: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage && lastPage.length === maxPostPerPage) {
        return allPages.length + 1
      }
      return undefined
    },
    initialPageParam: 1,
    select(data) {
      return data?.pages.flatMap((page) => page ?? []) as PostResult[]
    },
  })
}
