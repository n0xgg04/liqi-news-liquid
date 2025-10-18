import { supabase } from "../commons/supabase.ts";
import { z } from "zod";
import { Redis } from "https://deno.land/x/upstash_redis@v1.19.3/mod.ts";

const schema = z.object({
  post_id: z.string().uuid(),
  actor_id: z.string().uuid(),
  actor_name: z.string(),
  actor_avatar: z.string().optional(),
  action: z.enum(["like", "comment"]),
  target_user_id: z.string().uuid(),
});

interface NotificationEvent {
  post_id: string;
  actor_id: string;
  actor_name: string;
  actor_avatar?: string;
  action: "like" | "comment";
  target_user_id: string;
  timestamp: number;
}

interface AggregatedNotification {
  post_id: string;
  action: "like" | "comment";
  target_user_id: string;
  actors: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  count: number;
  latest_timestamp: number;
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

    const event = schema.parse(await req.json());

    if (event.actor_id === event.target_user_id) {
      return new Response(
        JSON.stringify({
          data: { message: "Self-action, no notification needed" },
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    const eventKey =
      `notification_event:${event.target_user_id}:${event.post_id}:${event.action}`;
    const notificationEvent: NotificationEvent = {
      ...event,
      timestamp: Date.now(),
    };

    await redis.lpush(eventKey, JSON.stringify(notificationEvent));
    await redis.expire(eventKey, 300);

    const eventCount = await redis.llen(eventKey);

    if (eventCount === 1) {
      await aggregateAndSendNotification(redis, eventKey, event);
    }

    return new Response(
      JSON.stringify({ data: { message: "Event queued for aggregation" } }),
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

async function aggregateAndSendNotification(
  redis: Redis,
  eventKey: string,
  originalEvent: z.infer<typeof schema>,
) {
  try {
    const events = await redis.lrange(eventKey, 0, -1);

    if (events.length === 0) {
      return;
    }

    const parsedEvents: NotificationEvent[] = events
      .map((event) => JSON.parse(event))
      .sort((a, b) => a.timestamp - b.timestamp);

    const actorMap = new Map<string, { name: string; avatar?: string }>();
    let latestTimestamp = 0;

    for (const event of parsedEvents) {
      actorMap.set(event.actor_id, {
        name: event.actor_name,
        avatar: event.actor_avatar,
      });
      latestTimestamp = Math.max(latestTimestamp, event.timestamp);
    }

    const aggregatedNotification: AggregatedNotification = {
      post_id: originalEvent.post_id,
      action: originalEvent.action,
      target_user_id: originalEvent.target_user_id,
      actors: Array.from(actorMap.entries()).map(([id, data]) => ({
        id,
        ...data,
      })),
      count: actorMap.size,
      latest_timestamp: latestTimestamp,
    };

    const { data: postData } = await supabase
      .from("posts")
      .select("title, author")
      .eq("post_id", originalEvent.post_id)
      .single();

    if (!postData) {
      console.error("Post not found:", originalEvent.post_id);
      return;
    }

    const message = createNotificationMessage(
      aggregatedNotification,
      postData.title,
    );

    await supabase.from("notifications").insert({
      user_id: originalEvent.target_user_id,
      type: aggregatedNotification.action,
      title: message.title,
      body: message.body,
      data: {
        post_id: originalEvent.post_id,
        post_title: postData.title,
        actors: aggregatedNotification.actors,
        action: aggregatedNotification.action,
      },
      is_read: false,
    });

    const { data: tokens } = await supabase
      .from("user_firebase_tokens")
      .select("token")
      .eq("user_id", originalEvent.target_user_id);

    if (tokens && tokens.length > 0) {
      await sendFCMNotification(tokens.map((t) => t.token), message);
    }

    await redis.del(eventKey);

    console.log("Notification sent:", aggregatedNotification);
  } catch (error) {
    console.error("Error aggregating notification:", error);
  }
}

function createNotificationMessage(
  notification: AggregatedNotification,
  postTitle: string,
): { title: string; body: string } {
  const { actors, count, action } = notification;

  if (count === 1) {
    const actor = actors[0];
    const actionText = action === "like" ? "thích" : "bình luận";
    return {
      title: `${actor.name} ${actionText} bài viết của bạn`,
      body: `"${postTitle}"`,
    };
  } else if (count === 2) {
    const actionText = action === "like" ? "thích" : "bình luận";
    return {
      title: `${actors[0].name} và 1 người khác ${actionText} bài viết của bạn`,
      body: `"${postTitle}"`,
    };
  } else {
    const actionText = action === "like" ? "thích" : "bình luận";
    return {
      title: `${actors[0].name} và ${
        count - 1
      } người khác ${actionText} bài viết của bạn`,
      body: `"${postTitle}"`,
    };
  }
}

async function sendFCMNotification(
  tokens: string[],
  message: { title: string; body: string },
) {
  const serviceAccount = JSON.parse(
    Deno.env.get("FIREBASE_SERVICE_ACCOUNT") || "{}",
  );
  const accessToken = await getAccessToken({
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key,
  });

  // Send to each token
  for (const token of tokens) {
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
              token: token,
              notification: {
                title: message.title,
                body: message.body,
              },
              data: {
                type: "post_interaction",
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
