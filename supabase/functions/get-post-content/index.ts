import { supabase } from "../commons/supabase.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "zod";
import { Redis } from "https://deno.land/x/upstash_redis@v1.19.3/mod.ts";

const schema = z.object({
  post_id: z.string().uuid(),
});

interface PostContent {
  post_id: string;
  title: string;
  content: string;
  created_at: string;
  author_id: string;
  name: string;
  avatar: string;
  attachments: Array<{
    attachment_id: string;
    url: string;
    type: string;
    created_at: string;
  }>;
}

Deno.serve(async (req) => {
  try {
    const redis = new Redis({
      url: Deno.env.get("UPSTASH_REDIS_REST_URL")!,
      token: Deno.env.get("UPSTASH_REDIS_REST_TOKEN")!,
    });

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method Not Allowed" }),
        { status: 405, headers: { "Content-Type": "application/json" } },
      );
    }

    const { post_id } = schema.parse(await req.json());

    const cacheKey = `post_content:${post_id}`;

    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return new Response(
          JSON.stringify({ data: cachedData }),
          { headers: { "Content-Type": "application/json" } },
        );
      }
    } catch (cacheError) {
      console.warn("Cache read error:", cacheError);
    }

    const { data: posts, error } = await supabase
      .from("posts")
      .select(`
        post_id,
        title,
        content,
        created_at,
        author,
        users!posts_author_fkey (
          uid,
          name,
          avatar
        ),
        attachments (
          id,
          url,
          type,
          created_at
        )
      `)
      .eq("is_deleted", false)
      .eq("post_id", post_id)
      .single();

    if (error) {
      throw error;
    }

    if (!posts) {
      return new Response(
        JSON.stringify({ error: "Post not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }

    const result: PostContent = {
      post_id: posts.post_id,
      title: posts.title || "",
      content: posts.content || "",
      created_at: posts.created_at,
      author_id: posts.users?.uid || "",
      name: posts.users?.name || "",
      avatar: posts.users?.avatar || "",
      attachments: posts.attachments?.map((att: any) => ({
        attachment_id: att.id,
        url: att.url,
        type: att.type,
        created_at: att.created_at,
      })) || [],
    };

    try {
      await redis.setex(cacheKey, 300, result);
    } catch (cacheError) {
      console.warn("Cache write error:", cacheError);
    }

    return new Response(
      JSON.stringify({ data: result }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    console.error("Function error:", error);

    if (
      error &&
      typeof error === "object" &&
      "issues" in (error as Record<string, unknown>)
    ) {
      return new Response(
        JSON.stringify({
          error: "Validation error",
          details:
            (error as Record<string, unknown> & { issues?: unknown }).issues,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const errorMessage = error instanceof Error
      ? error.message
      : (JSON.stringify(error));
    console.error("Error message:", errorMessage);

    return new Response(
      JSON.stringify({
        error: errorMessage,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
