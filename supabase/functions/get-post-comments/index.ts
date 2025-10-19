import { supabase } from "../commons/supabase.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "zod";
import { Redis } from "https://deno.land/x/upstash_redis@v1.19.3/mod.ts";

const schema = z.object({
  post_id: z.string().uuid(),
});

interface PostComments {
  comment_count: number;
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

    const { post_id } = schema.parse(await req.json());

    // Check if user is authenticated (optional for viewing comments)
    const authHeader = req.headers.get("Authorization");
    let user = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      try {
        const { data: { user: authUser }, error: authError } = await supabase
          .auth
          .getUser(token);
        if (!authError && authUser) {
          user = authUser;
        }
      } catch (error) {
        // Ignore invalid token errors - user will be treated as anonymous
        console.warn("Invalid token for get-post-comments:", error);
      }
    }

    const cacheKey = `post_comments:${post_id}`;

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

    // Get comment count (always available)
    const { data: summaryData, error: summaryError } = await supabase
      .from("post_summary")
      .select("comment_count")
      .eq("post_id", post_id)
      .single();

    if (summaryError) {
      throw summaryError;
    }

    // Check if user commented (only if authenticated)
    let isCommented = false;
    if (user) {
      const userSupabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${authHeader?.replace("Bearer ", "")}`,
            },
          },
        },
      );

      const { data: commentData } = await userSupabase
        .from("comments")
        .select("author")
        .eq("post_id", post_id)
        .eq("author", user.id)
        .single();

      isCommented = !!commentData;
    }

    const result: PostComments = {
      comment_count: summaryData?.comment_count || 0,
      is_commented: isCommented,
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
