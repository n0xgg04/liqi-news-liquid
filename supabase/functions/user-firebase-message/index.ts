import { createClient } from "npm:@supabase/supabase-js@2";
import { JWT } from "npm:google-auth-library@9";
import z from "npm:zod@3.24.2";
import serviceAccount from "../service-account.json" with {
  type: "json",
};
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const schema = z.object({
  user_id: z.string().optional(),
  body: z.string(),
  title: z.string(),
  screen: z.string().optional(),
  image_url: z.string().optional(),
});
Deno.serve(async (req) => {
  try {
    const payload = schema.parse(await req.json());
    const { user_id = null } = payload;
    const { data } = await supabase.from("firebase_messages").select(
      "fcm_token",
    )
      .eq("user_id", user_id)
      .single();

    const fcmToken = data?.fcm_token;
    const accessToken = await getAccessToken({
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    });
    console.log("TOKEN", accessToken);
    const res = await fetch(
      `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          message: {
            token: fcmToken,
            notification: {
              title: payload.title,
              body: payload.body,
            },
            data: {
              title: payload.title,
              body: payload.body,
              screen: payload.screen,
              image_url: payload.image_url,
            },
            android: {
              notification: {
                image: payload.image_url,
              },
            },
            apns: {
              payload: {
                aps: {
                  "mutable-content": 1,
                },
              },
              fcm_options: {
                image: payload.image_url,
              },
            },
          },
        }),
      },
    );
    const resData = await res.json();
    console.log("DATA", resData);
    if (res.status < 200 || 299 < res.status) {
      throw resData;
    }
    return new Response(JSON.stringify(resData), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: (error as any).message,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
});
const getAccessToken = (
  { clientEmail, privateKey }: { clientEmail: string; privateKey: string },
) => {
  return new Promise((resolve, reject) => {
    const jwtClient = new JWT({
      email: clientEmail,
      key: privateKey,
      scopes: [
        "https://www.googleapis.com/auth/firebase.messaging",
      ],
    });
    jwtClient.authorize((err, tokens) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(tokens?.access_token);
    });
  });
};
