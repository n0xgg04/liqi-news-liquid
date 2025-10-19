type GetCommentsReturn =
  Database["public"]["Functions"]["get_comments"]["Returns"][number];
type Props = {
  item: GetCommentsReturn;
};

export { Props };
