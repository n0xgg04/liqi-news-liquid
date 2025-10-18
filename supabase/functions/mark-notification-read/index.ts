import { supabase } from "../commons/supabase.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "zod";
import { Redis } from "https://deno.land/x/upstash_redis@v1.19.3/mod.ts";

const schema = z.object({
  notification_id: z.string().uuid().optional(),
  mark_all: z.boolean().default(false),
});

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

    const { notification_id, mark_all } = schema.parse(await req.json());

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

    let result;

    if (mark_all) {
      // Mark all notifications as read
      const { data, error } = await userSupabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) {
        throw error;
      }

      result = { message: "All notifications marked as read" };
    } else {
      // Mark specific notification as read
      if (!notification_id) {
        return new Response(
          JSON.stringify({
            error: "notification_id is required when mark_all is false",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const { data, error } = await userSupabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notification_id)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      result = { message: "Notification marked as read" };
    }

    // Clear notification cache for this user
    try {
      const pattern = `notifications:${user.id}:*`;
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (cacheError) {
      console.warn("Cache invalidation error:", cacheError);
    }

    return new Response(
      JSON.stringify({ data: result }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    console.error("Function error:", error);

    const errorMessage = error instanceof Error
      ? error.message
      : (JSON.stringify(error));

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
