import { supabase } from "../commons/supabase.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "zod";
import { Redis } from "https://deno.land/x/upstash_redis@v1.19.3/mod.ts";

const schema = z.object({
  page: z.number().min(0).default(0),
  limit: z.number().min(1).max(50).default(20),
});

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data: any;
  is_read: boolean;
  created_at: string;
  updated_at: string;
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

    const { page, limit } = schema.parse(await req.json());

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

    const cacheKey = `notifications:${user.id}:${page}:${limit}`;

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

    const offset = page * limit;

    const { data: notifications, error } = await userSupabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    const result = {
      notifications: notifications || [],
      pagination: {
        page,
        limit,
        has_more: (notifications?.length || 0) === limit,
      },
    };

    try {
      await redis.setex(cacheKey, 60, result);
    } catch (cacheError) {
      console.warn("Cache write error:", cacheError);
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
