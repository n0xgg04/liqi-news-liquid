import { supabase } from "../commons/supabase.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "zod";
import { Redis } from "https://deno.land/x/upstash_redis@v1.19.3/mod.ts";

const schema = z.object({
  post_id: z.string().uuid(),
});

interface LikeResponse {
  is_liked: boolean;
  like_count: number;
}

Deno.serve(async (req) => {
  try {
    let redis: Redis | null = null;

    try {
      redis = new Redis({
        url: Deno.env.get("UPSTASH_REDIS_REST_URL")!,
        token: Deno.env.get("UPSTASH_REDIS_REST_TOKEN")!,
      });
    } catch (redisError) {
      console.warn("Redis initialization error:", redisError);
    }

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

    const { data, error } = await userSupabase.rpc("toggle_like", {
      p_post_id: post_id,
    });

    if (error) {
      throw error;
    }

    const { data: postData } = await supabase
      .from("posts")
      .select("author")
      .eq("post_id", post_id)
      .single();

    if (data.is_liked && postData?.author !== user.id) {
      try {
        await fetch(
          `${
            Deno.env.get("SUPABASE_URL")
          }/functions/v1/create-notification-event`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${
                Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
              }`,
            },
            body: JSON.stringify({
              post_id: post_id,
              actor_id: user.id,
              actor_name: user.user_metadata?.full_name || user.email ||
                "Người dùng",
              actor_avatar: user.user_metadata?.avatar_url,
              action: "like",
              target_user_id: postData?.author,
            }),
          },
        );
      } catch (notifError) {
        console.warn("Failed to trigger notification:", notifError);
      }
    }

    try {
      await redis?.del(`post_likes:${post_id}`);
      await redis?.del(`post_user_status:${post_id}:${user.id}`);
    } catch (cacheError) {
      console.warn("Cache invalidation error:", cacheError);
    }

    return new Response(
      JSON.stringify({ data }),
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
