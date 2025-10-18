import { createClient } from "@supabase/supabase-js";
import z from "zod";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const schema = z.object({
  token: z.string().min(1),
  device_id: z.string().min(1),
  user_id: z.string().nullable().optional(),
});

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method Not Allowed" }),
        { status: 405, headers: { "Content-Type": "application/json" } },
      );
    }
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return new Response(
        JSON.stringify({ error: "Unsupported Media Type" }),
        { status: 415, headers: { "Content-Type": "application/json" } },
      );
    }

    const { token, device_id, user_id = null } = schema.parse(await req.json());
    const { error } = await supabase.from("firebase_messages").upsert({
      device_id,
      fcm_token: token,
      updated_at: new Date().toISOString(),
      user_id,
    });
    if (error) {
      return new Response(
        JSON.stringify({ error: error.message || "Database error" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    return new Response(
      JSON.stringify({ message: "Token added successfully" }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    console.log(error);
    if (error && typeof error === "object" && "issues" in (error as any)) {
      return new Response(
        JSON.stringify({
          error: "Validation error",
          details: (error as any).issues,
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
