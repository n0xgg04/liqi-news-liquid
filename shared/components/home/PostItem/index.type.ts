export type Props = {
  item: PostContent;
  handleLike: (item: PostContent) => void;
  handleComment: (item: PostContent) => void;
  handlePress: (item: PostContent) => void;
};
