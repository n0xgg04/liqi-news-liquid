export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      attachments: {
        Row: {
          created_at: string
          id: number
          post_id: string | null
          type: Database["public"]["Enums"]["attachment_type"]
          url: string
        }
        Insert: {
          created_at?: string
          id?: number
          post_id?: string | null
          type: Database["public"]["Enums"]["attachment_type"]
          url: string
        }
        Update: {
          created_at?: string
          id?: number
          post_id?: string | null
          type?: Database["public"]["Enums"]["attachment_type"]
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post_summary"
            referencedColumns: ["post_id"]
          },
          {
            foreignKeyName: "attachments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["post_id"]
          },
        ]
      }
      bundles: {
        Row: {
          channel: string
          enabled: boolean
          file_hash: string
          fingerprint_hash: string | null
          git_commit_hash: string | null
          id: string
          message: string | null
          metadata: Json | null
          platform: Database["public"]["Enums"]["platforms"]
          should_force_update: boolean
          storage_uri: string
          target_app_version: string | null
        }
        Insert: {
          channel?: string
          enabled: boolean
          file_hash: string
          fingerprint_hash?: string | null
          git_commit_hash?: string | null
          id: string
          message?: string | null
          metadata?: Json | null
          platform: Database["public"]["Enums"]["platforms"]
          should_force_update: boolean
          storage_uri: string
          target_app_version?: string | null
        }
        Update: {
          channel?: string
          enabled?: boolean
          file_hash?: string
          fingerprint_hash?: string | null
          git_commit_hash?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          platform?: Database["public"]["Enums"]["platforms"]
          should_force_update?: boolean
          storage_uri?: string
          target_app_version?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          author: string | null
          content: string
          created_at: string
          id: number
          post_id: string
        }
        Insert: {
          author?: string | null
          content: string
          created_at?: string
          id?: number
          post_id?: string
        }
        Update: {
          author?: string | null
          content?: string
          created_at?: string
          id?: number
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post_summary"
            referencedColumns: ["post_id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["post_id"]
          },
        ]
      }
      firebase_messages: {
        Row: {
          created_at: string
          device_id: string
          fcm_token: string
          id: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device_id?: string
          fcm_token?: string
          id?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device_id?: string
          fcm_token?: string
          id?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "firebase_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["uid"]
          },
        ]
      }
      follow: {
        Row: {
          created_at: string
          id: number
          target_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          target_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          target_id?: string
          user_id?: string
        }
        Relationships: []
      }
      games: {
        Row: {
          created_at: string
          id: number
          image_url: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          image_url: string
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          image_url?: string
          name?: string
        }
        Relationships: []
      }
      hero_roles: {
        Row: {
          created_at: string
          id: number
          image_url: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          image_url: string
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          image_url?: string
          name?: string
        }
        Relationships: []
      }
      heroes: {
        Row: {
          avatar_url: string
          birth: string | null
          color: string | null
          created_at: string
          hero_id: number
          id: number
          name: string
          role: number
          wallpaper: string | null
        }
        Insert: {
          avatar_url: string
          birth?: string | null
          color?: string | null
          created_at?: string
          hero_id?: number
          id?: number
          name: string
          role: number
          wallpaper?: string | null
        }
        Update: {
          avatar_url?: string
          birth?: string | null
          color?: string | null
          created_at?: string
          hero_id?: number
          id?: number
          name?: string
          role?: number
          wallpaper?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "heroes_role_fkey"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "hero_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string
          id: number
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post_summary"
            referencedColumns: ["post_id"]
          },
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["post_id"]
          },
        ]
      }
      news: {
        Row: {
          author: string | null
          content: string | null
          created_at: string
          game: number | null
          id: number
          post_id: string
          title: string | null
        }
        Insert: {
          author?: string | null
          content?: string | null
          created_at?: string
          game?: number | null
          id?: number
          post_id?: string
          title?: string | null
        }
        Update: {
          author?: string | null
          content?: string | null
          created_at?: string
          game?: number | null
          id?: number
          post_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_game_fkey"
            columns: ["game"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string | null
          meta: Json | null
          object_id: string | null
          object_type: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          meta?: Json | null
          object_id?: string | null
          object_type: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          meta?: Json | null
          object_id?: string | null
          object_type?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["uid"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["uid"]
          },
        ]
      }
      posts: {
        Row: {
          author: string
          content: string
          created_at: string
          id: number
          is_deleted: boolean
          post_id: string
          title: string
        }
        Insert: {
          author: string
          content: string
          created_at?: string
          id?: number
          is_deleted?: boolean
          post_id?: string
          title: string
        }
        Update: {
          author?: string
          content?: string
          created_at?: string
          id?: number
          is_deleted?: boolean
          post_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["uid"]
          },
        ]
      }
      tasks: {
        Row: {
          id: number
          name: string
          user_id: string
        }
        Insert: {
          id?: number
          name: string
          user_id?: string
        }
        Update: {
          id?: number
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          last_seen_notification: string | null
          user_id: string
        }
        Insert: {
          last_seen_notification?: string | null
          user_id: string
        }
        Update: {
          last_seen_notification?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["uid"]
          },
        ]
      }
      users: {
        Row: {
          avatar: string | null
          banner_image_url: string | null
          created_at: string
          id: number
          name: string | null
          uid: string
        }
        Insert: {
          avatar?: string | null
          banner_image_url?: string | null
          created_at?: string
          id?: number
          name?: string | null
          uid: string
        }
        Update: {
          avatar?: string | null
          banner_image_url?: string | null
          created_at?: string
          id?: number
          name?: string | null
          uid?: string
        }
        Relationships: []
      }
      users_love_hero_status: {
        Row: {
          created_at: string
          hero_id: number
          id: number
          last_time_check_in: string | null
          love_count: number | null
          uid: string
        }
        Insert: {
          created_at?: string
          hero_id: number
          id?: number
          last_time_check_in?: string | null
          love_count?: number | null
          uid: string
        }
        Update: {
          created_at?: string
          hero_id?: number
          id?: number
          last_time_check_in?: string | null
          love_count?: number | null
          uid?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_love_hero_status_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "heroes"
            referencedColumns: ["hero_id"]
          },
          {
            foreignKeyName: "users_love_hero_status_uid_fkey"
            columns: ["uid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["uid"]
          },
        ]
      }
      voice_over: {
        Row: {
          audio_url: string
          caption: string | null
          created_at: string
          hero_id: number
          id: number
        }
        Insert: {
          audio_url: string
          caption?: string | null
          created_at?: string
          hero_id: number
          id?: number
        }
        Update: {
          audio_url?: string
          caption?: string | null
          created_at?: string
          hero_id?: number
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "voice_over_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "heroes"
            referencedColumns: ["hero_id"]
          },
        ]
      }
    }
    Views: {
      likes_summary: {
        Row: {
          like_count: number | null
          post_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post_summary"
            referencedColumns: ["post_id"]
          },
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["post_id"]
          },
        ]
      }
      post_summary: {
        Row: {
          comment_count: number | null
          like_count: number | null
          post_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_all_active_posts: {
        Args: Record<PropertyKey, never>
        Returns: {
          content: string
          created_at: string
          id: number
          is_deleted: boolean
          title: string
        }[]
      }
      get_channels: {
        Args: Record<PropertyKey, never>
        Returns: {
          channel: string
        }[]
      }
      get_comments: {
        Args: { p_page?: number; p_per_page?: number; p_post_id: string }
        Returns: {
          author_avatar: string
          author_name: string
          content: string
          created_at: string
          id: number
          post_id: string
        }[]
      }
      get_my_post: {
        Args: { page_number?: number; per_page?: number }
        Returns: {
          attachments: Json
          author_avatar: string
          author_id: string
          author_name: string
          comment_count: number
          content: string
          created_at: string
          is_commented: boolean
          is_liked: boolean
          like_count: number
          post_id: string
          title: string
        }[]
      }
      get_post: {
        Args: { page_number: number; per_page: number }
        Returns: {
          attachments: Json
          avatar: string
          comment_count: number
          content: string
          created_at: string
          is_commented: boolean
          is_liked: boolean
          like_count: number
          name: string
          post_id: string
          title: string
          uid: string
        }[]
      }
      get_post_by_id: {
        Args: { p_post_id: string }
        Returns: {
          attachments: Json
          avatar: string
          comment_count: number
          content: string
          created_at: string
          is_commented: boolean
          is_liked: boolean
          like_count: number
          name: string
          post_id: string
          title: string
          uid: string
        }[]
      }
      get_target_app_version_list: {
        Args: {
          app_platform: Database["public"]["Enums"]["platforms"]
          min_bundle_id: string
        }
        Returns: {
          target_app_version: string
        }[]
      }
      get_update_info_by_app_version: {
        Args: {
          app_platform: Database["public"]["Enums"]["platforms"]
          app_version: string
          bundle_id: string
          min_bundle_id: string
          target_app_version_list: string[]
          target_channel: string
        }
        Returns: {
          id: string
          message: string
          should_force_update: boolean
          status: string
          storage_uri: string
        }[]
      }
      get_update_info_by_fingerprint_hash: {
        Args: {
          app_platform: Database["public"]["Enums"]["platforms"]
          bundle_id: string
          min_bundle_id: string
          target_channel: string
          target_fingerprint_hash: string
        }
        Returns: {
          id: string
          message: string
          should_force_update: boolean
          status: string
          storage_uri: string
        }[]
      }
      increase_user_love_hero_status: {
        Args: { p_hero_id: number; p_uid: string } | { uid: string }
        Returns: undefined
      }
      notify: {
        Args: {
          p_body: string
          p_image_url?: string
          p_screen?: string
          p_title: string
          p_user_id: string
        }
        Returns: Json
      }
      send_firebase_message: {
        Args: {
          p_body: string
          p_image_url?: string
          p_screen?: string
          p_title: string
          p_user_id: string
        }
        Returns: undefined
      }
      toggle_like: {
        Args: { p_post_id: string } | { p_post_id: string; p_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      attachment_type: "image" | "video" | "file" | "youtube_url" | "audio"
      hero_roles_enum: "ad" | "ap" | "tank" | "sp"
      notification_type: "like" | "comment" | "follow" | "mention" | "system"
      platforms: "ios" | "android"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      attachment_type: ["image", "video", "file", "youtube_url", "audio"],
      hero_roles_enum: ["ad", "ap", "tank", "sp"],
      notification_type: ["like", "comment", "follow", "mention", "system"],
      platforms: ["ios", "android"],
    },
  },
} as const
