import { useInfiniteQuery } from '@tanstack/react-query'
import { KEYS } from '../constants/query-keys'
import { supabase } from '../libs/supabase'

type Props = {
  maxPostPerPage: number
  rpcName?: Parameters<typeof supabase.rpc>[0]
}

export default function usePosts({ maxPostPerPage, rpcName = 'get_post' }: Props) {
  return useInfiniteQuery({
    queryKey: [KEYS.NEW_FEED],
    queryFn: async ({ pageParam = 0 }) => {
      const { data } = await supabase
        .rpc(rpcName, {
          page_number: pageParam,
          per_page: maxPostPerPage,
        })
        .select('*')
        .order('created_at', { ascending: false })

      return data
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
      return data?.pages.flatMap((page) => page ?? [])
    },
  })
}
