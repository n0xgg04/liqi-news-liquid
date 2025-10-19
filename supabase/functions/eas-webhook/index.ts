// No database imports needed - only Discord notifications

interface EASBuildPayload {
  id: string;
  accountName: string;
  projectName: string;
  buildDetailsPageUrl: string;
  parentBuildId?: string;
  appId: string;
  initiatingUserId: string;
  cancelingUserId?: string;
  platform: "android" | "ios";
  status: "errored" | "finished" | "canceled";
  artifacts?: {
    buildUrl?: string;
    logsS3KeyPrefix?: string;
  };
  metadata: {
    appName: string;
    username: string;
    workflow: string;
    appVersion: string;
    appBuildVersion: string;
    cliVersion: string;
    sdkVersion: string;
    buildProfile: string;
    distribution: string;
    appIdentifier: string;
    gitCommitHash: string;
    gitCommitMessage: string;
    runtimeVersion: string;
    channel?: string;
    releaseChannel?: string;
    reactNativeVersion: string;
    trackingContext: Record<string, any>;
    credentialsSource: string;
    isGitWorkingTreeDirty: boolean;
    message?: string;
    runFromCI: boolean;
  };
  metrics: {
    memory: number;
    buildEndTimestamp: number;
    totalDiskReadBytes: number;
    buildStartTimestamp: number;
    totalDiskWriteBytes: number;
    cpuActiveMilliseconds: number;
    buildEnqueuedTimestamp: number;
    totalNetworkEgressBytes: number;
    totalNetworkIngressBytes: number;
  };
  error?: {
    message: string;
    errorCode: string;
  };
  createdAt: string;
  enqueuedAt: string;
  provisioningStartedAt?: string;
  workerStartedAt?: string;
  completedAt?: string;
  updatedAt: string;
  expirationDate?: string;
  priority: "high" | "normal" | "low";
  resourceClass: string;
  actualResourceClass: string;
  maxRetryTimeMinutes: number;
}

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method Not Allowed" }),
        { status: 405, headers: { "Content-Type": "application/json" } },
      );
    }

    // Verify webhook signature
    const expoSignature = req.headers.get("expo-signature");
    const webhookSecret = Deno.env.get("EAS_WEBHOOK_SECRET");

    if (!expoSignature || !webhookSecret) {
      return new Response(
        JSON.stringify({ error: "Missing signature or secret" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const body = await req.text();

    // Verify HMAC signature
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(webhookSecret),
      { name: "HMAC", hash: "SHA-1" },
      false,
      ["sign"],
    );

    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(body),
    );
    const hash = `sha1=${
      Array.from(new Uint8Array(signature))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
    }`;

    if (expoSignature !== hash) {
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    // Parse payload
    const payload: EASBuildPayload = JSON.parse(body);

    // Send Discord notification
    await sendDiscordNotification(payload);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Webhook processed successfully",
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    console.error("EAS webhook error:", error);

    const errorMessage = error instanceof Error
      ? error.message
      : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});

async function sendDiscordNotification(payload: EASBuildPayload) {
  const discordWebhookUrl = Deno.env.get("DISCORD_WEBHOOK_URL");

  if (!discordWebhookUrl) {
    console.warn("Discord webhook URL not configured");
    return;
  }

  try {
    // Determine status emoji and color
    let statusEmoji = "🔨";
    let color = 0x3498db; // Blue for default

    switch (payload.status) {
      case "finished":
        statusEmoji = "✅";
        color = 0x2ecc71; // Green
        break;
      case "errored":
        statusEmoji = "❌";
        color = 0xe74c3c; // Red
        break;
      case "canceled":
        statusEmoji = "⏹️";
        color = 0x95a5a6; // Gray
        break;
    }

    // Calculate build duration
    const duration = payload.completedAt
      ? Math.round(
        (new Date(payload.completedAt).getTime() -
          new Date(payload.createdAt).getTime()) / 1000 / 60,
      )
      : null;

    // Create Discord embed
    const embed = {
      title: `${statusEmoji} EAS Build ${
        payload.status.charAt(0).toUpperCase() + payload.status.slice(1)
      }`,
      color: color,
      fields: [
        {
          name: "Project",
          value: `${payload.accountName}/${payload.projectName}`,
          inline: true,
        },
        {
          name: "Platform",
          value: payload.platform.toUpperCase(),
          inline: true,
        },
        {
          name: "Profile",
          value: payload.metadata.buildProfile,
          inline: true,
        },
        {
          name: "App Version",
          value:
            `${payload.metadata.appVersion} (${payload.metadata.appBuildVersion})`,
          inline: true,
        },
        {
          name: "Distribution",
          value: payload.metadata.distribution,
          inline: true,
        },
      ],
      timestamp: new Date(payload.updatedAt).toISOString(),
      footer: {
        text: `Build ID: ${payload.id}`,
      },
    };

    // Add duration if available
    if (duration !== null) {
      embed.fields.push({
        name: "Duration",
        value: `${duration} minutes`,
        inline: true,
      });
    }

    // Add error info if build failed
    if (payload.status === "errored" && payload.error) {
      embed.fields.push({
        name: "Error",
        value: `\`${payload.error.errorCode}\`: ${payload.error.message}`,
        inline: false,
      });
    }

    // Add build URL if successful
    if (payload.status === "finished" && payload.artifacts?.buildUrl) {
      embed.fields.push({
        name: "Download",
        value: `[Download Build](${payload.artifacts.buildUrl})`,
        inline: false,
      });
    }

    // Add commit info if available
    if (payload.metadata.gitCommitMessage) {
      embed.fields.push({
        name: "Commit",
        value: `\`${
          payload.metadata.gitCommitHash.substring(0, 7)
        }\`: ${payload.metadata.gitCommitMessage}`,
        inline: false,
      });
    }

    // Add build details link
    embed.fields.push({
      name: "Details",
      value:
        `[View on Expo](https://expo.dev/accounts/${payload.accountName}/projects/${payload.projectName}/builds/${payload.id})`,
      inline: false,
    });

    const discordPayload = {
      username: "EAS Build Bot",
      avatar_url: "https://avatars.githubusercontent.com/u/12504344?s=200&v=4", // Expo logo
      embeds: [embed],
    };

    const response = await fetch(discordWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(discordPayload),
    });

    if (!response.ok) {
      console.error(
        "Failed to send Discord notification:",
        await response.text(),
      );
    }
  } catch (error) {
    console.error("Discord notification error:", error);
  }
}
