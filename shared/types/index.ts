declare global {
  type Database = import("./database.types").Database;

  type PostAttachments = {
    attachment_id: number;
    created_at: string;
    type: string;
    url: string;
  };

  type PostContent = {
    avatar: string;
    name: string;
    created_at: string;
    title: string;
    content: string;
    attachments: PostAttachments[];
    like_count: number;
    comment_count: number;
    post_id: string;
    is_liked: boolean;
    is_commented: boolean;
  };
}

export {};
