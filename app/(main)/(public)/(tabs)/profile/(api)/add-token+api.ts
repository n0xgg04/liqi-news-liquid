import supabaseServer from "@/shared/libs/supabase.server";
import z from "zod";

const schema = z.object({
  token: z.string({ error: "Token is required" }),
  device_id: z.string({ error: "Device ID is required" }),
  user_id: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, device_id, user_id = null } = schema.parse(body);

    const { error } = await supabaseServer.from("firebase_messages").upsert({
      device_id,
      fcm_token: token,
      updated_at: new Date().toISOString(),
      user_id,
    });

    if (error) {
      throw error;
    }
    return Response.json({
      message: "Token added successfully",
    });
  } catch (error) {
    return Response.json({ error: (error as any).message }, { status: 400 });
  }
}
