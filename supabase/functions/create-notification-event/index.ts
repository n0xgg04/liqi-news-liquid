import { supabase } from "../commons/supabase.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "zod";

const schema = z.object({
  post_id: z.string().uuid(),
  actor_id: z.string().uuid(),
  actor_name: z.string(),
  actor_avatar: z.string().optional(),
  action: z.enum(["like", "comment"]),
  target_user_id: z.string().uuid(),
});

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method Not Allowed" }),
        { status: 405, headers: { "Content-Type": "application/json" } },
      );
    }

    const event = schema.parse(await req.json());

    // Don't notify if user is acting on their own post
    if (event.actor_id === event.target_user_id) {
      return new Response(
        JSON.stringify({
          data: { message: "Self-action, no notification needed" },
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    // Insert notification event into database
    const { error } = await supabase.from("notification_events").insert({
      post_id: event.post_id,
      actor_id: event.actor_id,
      actor_name: event.actor_name,
      actor_avatar: event.actor_avatar,
      action: event.action,
      target_user_id: event.target_user_id,
    });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ data: { message: "Notification event created" } }),
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
