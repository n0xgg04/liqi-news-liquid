import { supabase } from "../commons/supabase.ts";
import z from "zod";
import { Redis } from "https://deno.land/x/upstash_redis@v1.19.3/mod.ts";

const schema = z.object({
  page_number: z.number().min(1).default(1),
  per_page: z.number().min(1).max(20).default(10),
});

interface PostResult {
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
  like_count: number;
  comment_count: number;
  is_liked: boolean;
  is_commented: boolean;
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

    const { page_number, per_page } = schema.parse(await req.json());

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      token,
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    const userId = user.id;

    const cacheKey = `my_posts:${userId}:${page_number}:${per_page}`;

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

    const offset = Math.max((page_number - 1) * per_page, 0);

    const { data: posts, error: postsError } = await supabase
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
        )
      `)
      .eq("is_deleted", false)
      .eq("author", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + per_page - 1);

    if (postsError) {
      throw postsError;
    }

    if (!posts || posts.length === 0) {
      return new Response(
        JSON.stringify({ data: [] }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    const postIds = posts.map((p: any) => p.post_id);

    const [attachmentsResult, likesResult, commentsResult, postSummaryResult] =
      await Promise.all([
        supabase
          .from("attachments")
          .select("id, url, type, created_at, post_id")
          .in("post_id", postIds),

        supabase
          .from("likes")
          .select("post_id, user_id")
          .in("post_id", postIds)
          .eq("user_id", userId),

        supabase
          .from("comments")
          .select("post_id, author")
          .in("post_id", postIds)
          .eq("author", userId),

        supabase
          .from("post_summary")
          .select("post_id, like_count, comment_count")
          .in("post_id", postIds),
      ]);

    const attachmentsMap = new Map<
      string,
      Array<{
        attachment_id: string;
        url: string;
        type: string;
        created_at: string;
      }>
    >();

    if (attachmentsResult.data) {
      attachmentsResult.data.forEach((att: any) => {
        if (!attachmentsMap.has(att.post_id)) {
          attachmentsMap.set(att.post_id, []);
        }
        attachmentsMap.get(att.post_id)!.push({
          attachment_id: att.id,
          url: att.url,
          type: att.type,
          created_at: att.created_at,
        });
      });
    }

    const likedPosts = new Set(
      likesResult.data?.map((l: any) => l.post_id) || [],
    );
    const commentedPosts = new Set(
      commentsResult.data?.map((c: any) => c.post_id) || [],
    );

    const summaryMap = new Map<
      string,
      { like_count: number; comment_count: number }
    >();
    if (postSummaryResult.data) {
      postSummaryResult.data.forEach((s: any) => {
        summaryMap.set(s.post_id, {
          like_count: s.like_count || 0,
          comment_count: s.comment_count || 0,
        });
      });
    }

    const result: PostResult[] = posts.map((post: any) => {
      const summary = summaryMap.get(post.post_id) ||
        { like_count: 0, comment_count: 0 };

      return {
        post_id: post.post_id,
        title: post.title || "",
        content: post.content || "",
        created_at: post.created_at,
        author_id: post.users?.uid || "",
        name: post.users?.name || "",
        avatar: post.users?.avatar || "",
        attachments: attachmentsMap.get(post.post_id) || [],
        like_count: summary.like_count,
        comment_count: summary.comment_count,
        is_liked: likedPosts.has(post.post_id),
        is_commented: commentedPosts.has(post.post_id),
      };
    });

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
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
});
