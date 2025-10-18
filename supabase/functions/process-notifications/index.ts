import { supabase } from "../commons/supabase.ts";

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method Not Allowed" }),
        { status: 405, headers: { "Content-Type": "application/json" } },
      );
    }

    const { error } = await supabase.rpc("process_notification_events");

    if (error) {
      throw error;
    }

    const { data: unreadNotifications } = await supabase
      .from("notifications")
      .select("user_id")
      .eq("is_read", false);

    if (unreadNotifications && unreadNotifications.length > 0) {
      const userNotifications = unreadNotifications.reduce((acc, notif) => {
        acc[notif.user_id] = (acc[notif.user_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      for (const [userId, count] of Object.entries(userNotifications)) {
        try {
          await sendFCMNotification(userId, count);
        } catch (fcmError) {
          console.warn("Failed to send FCM for user", userId, fcmError);
        }
      }
    }

    return new Response(
      JSON.stringify({
        data: {
          message: "Notifications processed successfully",
          processed: unreadNotifications?.length || 0,
        },
      }),
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

async function sendFCMNotification(userId: string, unreadCount: number) {
  // Get user's FCM tokens
  const { data: tokens } = await supabase
    .from("user_firebase_tokens")
    .select("token")
    .eq("user_id", userId);

  if (!tokens || tokens.length === 0) {
    return;
  }

  const serviceAccount = JSON.parse(
    Deno.env.get("FIREBASE_SERVICE_ACCOUNT") || "{}",
  );
  const accessToken = await getAccessToken({
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key,
  });

  const title = unreadCount === 1
    ? "Bạn có thông báo mới"
    : `Bạn có ${unreadCount} thông báo mới`;

  for (const tokenData of tokens) {
    try {
      const response = await fetch(
        `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            message: {
              token: tokenData.token,
              notification: {
                title: title,
                body: "Nhấn để xem chi tiết",
              },
              data: {
                type: "notifications_update",
                unread_count: unreadCount.toString(),
              },
              android: {
                notification: {
                  sound: "default",
                },
              },
              apns: {
                payload: {
                  aps: {
                    sound: "default",
                  },
                },
              },
            },
          }),
        },
      );

      if (!response.ok) {
        console.error("FCM send failed:", await response.text());
      }
    } catch (error) {
      console.error("Error sending FCM notification:", error);
    }
  }
}

const getAccessToken = (
  { clientEmail, privateKey }: { clientEmail: string; privateKey: string },
) => {
  return new Promise((resolve, reject) => {
    const jwtClient = new (globalThis as any).google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: [
        "https://www.googleapis.com/auth/firebase.messaging",
      ],
    });
    jwtClient.authorize((err: any, tokens: any) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(tokens?.access_token);
    });
  });
};
