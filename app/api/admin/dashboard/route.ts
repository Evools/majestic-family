import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const dashboardSettingsSchema = z.object({
  bonusActive: z.boolean().optional(),
  bonusTitle: z.string().optional(),
  bonusDescription: z.string().optional(),
  familyBalance: z.number().optional(),
  goalName: z.string().optional(),
  goalTarget: z.number().optional(),
  goalCurrent: z.number().optional(),
  familyLevel: z.number().int().optional(),
  familyXP: z.number().int().optional(),
  familyXPRequired: z.number().int().optional(),
});

// GET: Fetch dashboard settings
export async function GET() {
  try {
    // Get or create settings (there should only be one row)
    let settings = await prisma.dashboardSettings.findFirst();

    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.dashboardSettings.create({
        data: {},
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Dashboard settings fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard settings' },
      { status: 500 }
    );
  }
}

// PATCH: Update dashboard settings (admin only)
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { role: true },
  });

  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = dashboardSettingsSchema.parse(body);

    // Get existing settings
    let settings = await prisma.dashboardSettings.findFirst();

    if (!settings) {
      // Create if doesn't exist
      settings = await prisma.dashboardSettings.create({
        data,
      });
    } else {
      // Update existing
      settings = await prisma.dashboardSettings.update({
        where: { id: settings.id },
        data,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: (error as any).errors[0].message },
        { status: 400 }
      );
    }

    console.error('Dashboard settings update error:', error);
    return NextResponse.json(
      { error: 'Failed to update dashboard settings' },
      { status: 500 }
    );
  }
}
