import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      totalMembers,
      pendingReports,
      activeContracts,
      dashboardSettings,
      recentReports
    ] = await Promise.all([
      prisma.user.count(),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.userContract.count({ where: { status: 'ACTIVE' } }),
      prisma.dashboardSettings.findFirst(),
      prisma.report.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, firstName: true, lastName: true, image: true }
          }
        }
      })
    ]);

    return NextResponse.json({
      totalMembers,
      pendingReports,
      activeContracts,
      familyBalance: dashboardSettings?.familyBalance || 0,
      recentReports
    });

  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
