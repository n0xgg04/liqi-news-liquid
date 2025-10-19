import { Link } from 'expo-router'
import React from 'react'
import PostContent from '../PostContent'
import { Props } from './index.type'

export default function PostItem({ item, handleLike, handleComment, handlePress }: Props) {
  return (
    <Link href={`/posts/${item.post_id}`} asChild>
      <Link.Trigger>
        <PostContent
          item={item}
          handleLike={handleLike}
          handleComment={handleComment}
          handlePress={handlePress}
          clickImageBehavior="openPost"
        />
      </Link.Trigger>
      <Link.Preview style={{ width: 500, height: 500 }} />
      <Link.Menu>
        <Link.MenuAction title="Share" icon="square.and.arrow.up" onPress={() => {}} />
        <Link.MenuAction title="Block" icon="nosign" destructive onPress={() => {}} />
      </Link.Menu>
    </Link>
  )
}
