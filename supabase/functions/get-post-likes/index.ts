import { supabase } from "../commons/supabase.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "zod";
import { Redis } from "https://deno.land/x/upstash_redis@v1.19.3/mod.ts";

const schema = z.object({
  post_id: z.string().uuid(),
});

interface PostLikes {
  like_count: number;
  is_liked: boolean;
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

    const cacheKey = `post_likes:${post_id}`;

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

    const userSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      },
    );

    const [summaryResult, likeResult] = await Promise.all([
      supabase
        .from("post_summary")
        .select("like_count")
        .eq("post_id", post_id)
        .single(),

      userSupabase
        .from("likes")
        .select("user_id")
        .eq("post_id", post_id)
        .eq("user_id", user.id)
        .single(),
    ]);

    const result: PostLikes = {
      like_count: summaryResult.data?.like_count || 0,
      is_liked: !!likeResult.data,
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
