import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const settingsSchema = z.object({
  familyName: z.string().optional(),
  familyDescription: z.string().optional(),
  familyLogoUrl: z.string().optional(),
  userSharePercent: z.number().min(0).max(100).optional(),
  familySharePercent: z.number().min(0).max(100).optional(),
  minWithdrawal: z.number().min(0).optional(),
  contractCooldownHours: z.number().min(0).optional(),
  autoApproveReports: z.boolean().optional(),
  xpMultiplier: z.number().min(0).optional(),
  baseXPRequired: z.number().min(0).optional(),
  discordWebhook: z.string().optional(),
  notifyNewReports: z.boolean().optional(),
  notifyAdminActions: z.boolean().optional(), // Added this line
  maxActiveContracts: z.number().min(1).optional(), // Added this line
});

// GET: Fetch system settings
export async function GET() {
  try {
    let settings = await prisma.systemSettings.findFirst({
      select: {
        familyName: true,
        familyDescription: true,
        familyLogoUrl: true,
        userSharePercent: true,
        familySharePercent: true,
        minWithdrawal: true,
        contractCooldownHours: true,
        autoApproveReports: true,
        xpMultiplier: true,
        baseXPRequired: true,
        discordWebhook: true,
        notifyNewReports: true,
        notifyAdminActions: true,
        maxActiveContracts: true,
      }
    });

    if (!settings) {
      // defaults
      return NextResponse.json({
        userSharePercent: 60,
        familySharePercent: 40,
        minWithdrawal: 10000,
        contractCooldownHours: 24,
        autoApproveReports: false,
        xpMultiplier: 1.5,
        baseXPRequired: 1000,
        notifyNewReports: false,
        notifyAdminActions: false,
        maxActiveContracts: 3,
      });
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error('System settings fetch error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH: Update system settings (admin only)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = settingsSchema.parse(body);

    let settings = await prisma.systemSettings.findFirst();

    if (!settings) {
      settings = await prisma.systemSettings.create({ data: { ...data, notifyAdminActions: data.notifyAdminActions ?? false, maxActiveContracts: data.maxActiveContracts ?? 3 } });
    } else {
      settings = await prisma.systemSettings.update({
        where: { id: settings.id },
        data,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('System settings update error:', error);
    return NextResponse.json(
      { error: 'Failed to update system settings' },
      { status: 500 }
    );
  }
}
