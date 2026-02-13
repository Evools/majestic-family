import { prisma } from "@/lib/prisma";

interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

interface DiscordEmbed {
  title?: string;
  url?: string;
  description?: string;
  color?: number;
  fields?: DiscordEmbedField[];
  footer?: {
    text: string;
  };
  timestamp?: string;
  thumbnail?: {
    url: string;
  };
  image?: {
    url: string;
  };
}

export async function sendDiscordNotification(embeds: DiscordEmbed[]): Promise<string | null> {
  try {
    const settings = await prisma.systemSettings.findFirst();

    if (!settings?.discordWebhook) {
      return null;
    }

    // Append ?wait=true to get the message object back
    const webhookUrl = new URL(settings.discordWebhook);
    webhookUrl.searchParams.set('wait', 'true');

    const res = await fetch(webhookUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        embeds: embeds,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.id || null;
    }
    return null;

  } catch (error) {
    console.error("Failed to send Discord notification:", error);
    return null;
  }
}

export async function updateDiscordMessage(messageId: string, embeds: DiscordEmbed[]) {
  try {
    const settings = await prisma.systemSettings.findFirst();

    if (!settings?.discordWebhook) {
      return;
    }

    // Webhook URL format: https://discord.com/api/webhooks/{webhook.id}/{webhook.token}
    // To edit: https://discord.com/api/webhooks/{webhook.id}/{webhook.token}/messages/{message.id}

    const webhookUrl = settings.discordWebhook;
    const editUrl = `${webhookUrl}/messages/${messageId}`;

    await fetch(editUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        embeds: embeds,
      }),
    });
  } catch (error) {
    console.error("Failed to update Discord notification:", error);
  }
}

export async function sendNewReportNotification(report: any, user: any) {
  try {
    const settings = await prisma.systemSettings.findFirst();

    if (!settings?.discordWebhook || !settings.notifyNewReports) {
      return;
    }

    const proofUrls = report.proof ? report.proof.split(',') : [];
    const mainProofUrl = proofUrls[0] || "";

    // Create links list for the description/fields
    const proofLinks = proofUrls.map((url: string, index: number) => `[Скриншот ${index + 1}](${url})`).join(', ');

    const embed: DiscordEmbed = {
      title: "Новый отчет",
      description: `**${user.name}** отправил новый отчет.`,
      color: 0xe81c5a, // Shelly Red
      fields: [
        { name: "Предмет", value: report.itemName, inline: true },
        { name: "Количество", value: report.quantity.toString(), inline: true },
        { name: "Контракт", value: report.contractType, inline: false },
        { name: "Доказательства", value: proofLinks || "Нет", inline: false },
      ],
      thumbnail: {
        url: user.image || "",
      },
      image: {
        url: mainProofUrl,
      },
      timestamp: new Date().toISOString(),
      footer: {
        text: "Shelby Family",
      },
      url: "https://shelby-family.vercel.app", // Dummy URL to group embeds
    };

    if (report.comment) {
      embed.fields?.push({ name: "Комментарий", value: report.comment, inline: false });
    }

    const embeds = [embed];

    // Add additional images as separate embeds (Discord Gallery style)
    // Only up to 4 images total normally display well in a grid, but we can send up to 10 embeds.
    for (let i = 1; i < proofUrls.length && i < 4; i++) {
      embeds.push({
        title: "",
        url: "https://shelby-family.vercel.app", // Same URL groups them
        image: {
          url: proofUrls[i]
        },
        color: 0xe81c5a
      });
    }

    const messageId = await sendDiscordNotification(embeds);

    if (messageId && report.id) {
      await prisma.report.update({
        where: { id: report.id },
        data: { discordMessageId: messageId }
      });
    }

  } catch (error) {
    console.error("Failed to send new report notification:", error);
  }
}

export async function sendReportActionNotification(report: any, admin: any, action: 'approve' | 'reject', reason?: string) {
  try {
    const settings = await prisma.systemSettings.findFirst();

    if (!settings?.discordWebhook || !settings.notifyAdminActions) {
      return;
    }

    const isApprove = action === 'approve';
    const color = isApprove ? 0x22c55e : 0xef4444; // Green or Red
    const title = isApprove ? "Отчет одобрен" : "Отчет отклонен";

    // Fetch contract title if not present in report object
    let contractTitle = report.contractType;
    if (!contractTitle && report.userContract?.contract?.title) {
      contractTitle = report.userContract.contract.title;
    }

    const embed: DiscordEmbed = {
      title: title,
      description: `Администратор **${admin.name}** ${isApprove ? 'одобрил' : 'отклонил'} отчет пользователя **${report.user?.name || 'Неизвестно'}**.`,
      color: color,
      fields: [
        { name: "Контракт", value: contractTitle || "Неизвестно", inline: true },
        { name: "Предмет", value: report.itemName, inline: true },
        { name: "Количество", value: report.quantity.toString(), inline: true },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: "Shelby Family",
      },
    };

    if (isApprove) {
      embed.fields?.push({ name: "Выплата", value: `$${report.value?.toLocaleString()}`, inline: false });
    } else if (reason) {
      embed.fields?.push({ name: "Причина отказа", value: reason, inline: false });
    }

    await sendDiscordNotification([embed]);

  } catch (error) {
    console.error("Failed to send report action notification:", error);
  }
}
