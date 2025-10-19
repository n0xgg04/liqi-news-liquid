import { Link } from 'expo-router'
import React from 'react'
import PostContent from '../PostContent'
import { Props } from './index.type'

export default function PostItem({ item, handleLike, handleComment, handlePress }: Props) {
  return (
    <Link href={`/posts/${item.post_id}`} asChild>
      <PostContent
        item={item}
        handleLike={handleLike}
        handleComment={handleComment}
        handlePress={handlePress}
        clickImageBehavior="openPost"
      />
    </Link>
  )
}
