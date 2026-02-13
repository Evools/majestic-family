import { prisma } from "@/lib/prisma";

interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

interface DiscordEmbed {
  title: string;
  description?: string;
  color?: number;
  fields?: DiscordEmbedField[];
  footer?: {
    text: string;
  };
  timestamp?: string;
  thumbnail?: {
    url: string;
  }
}

export async function sendDiscordNotification(embed: DiscordEmbed) {
  try {
    const settings = await prisma.systemSettings.findFirst();

    if (!settings?.discordWebhook) {
      return;
    }

    await fetch(settings.discordWebhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        embeds: [embed],
      }),
    });
  } catch (error) {
    console.error("Failed to send Discord notification:", error);
  }
}

export async function sendNewReportNotification(report: any, user: any) {
  try {
    const settings = await prisma.systemSettings.findFirst();

    if (!settings?.discordWebhook || !settings.notifyNewReports) {
      return;
    }

    const embed: DiscordEmbed = {
      title: "Новый отчет",
      description: `**${user.name}** отправил новый отчет.`,
      color: 0xe81c5a, // Shelly Red
      fields: [
        { name: "Предмет", value: report.itemName, inline: true },
        { name: "Количество", value: report.quantity.toString(), inline: true },
        { name: "Контракт", value: report.contractType, inline: false },
        { name: "Доказательство", value: `[Открыть скриншот](${report.proof})`, inline: true },
      ],
      thumbnail: {
        url: user.image || "",
      },
      timestamp: new Date().toISOString(),
      footer: {
        text: "Shelby Family",
      },
    };

    if (report.comment) {
      embed.fields?.push({ name: "Комментарий", value: report.comment, inline: false });
    }

    await sendDiscordNotification(embed);
  } catch (error) {
    console.error("Failed to send new report notification:", error);
  }
}
