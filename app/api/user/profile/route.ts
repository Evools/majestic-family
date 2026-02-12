import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        reports: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        userContracts: {
          where: { status: 'ACTIVE' },
          include: {
            contract: true
          }
        },
        _count: {
          select: { reports: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate stats
    const totalEarned = await prisma.report.aggregate({
      where: { userId: user.id, status: 'APPROVED' },
      _sum: { userShare: true }
    });

    const approvedReportsCount = await prisma.report.count({
      where: { userId: user.id, status: 'APPROVED' }
    });

    const profileData = {
      user: {
        id: user.id,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        image: user.image,
        role: user.role,
        rank: user.rank,
        staticId: user.staticId,
        createdAt: user.createdAt,
      },
      stats: {
        totalEarned: totalEarned._sum.userShare || 0,
        totalReports: user._count.reports,
        approvedReports: approvedReportsCount,
        activeContracts: user.userContracts.length
      },
      activeContracts: user.userContracts,
      recentActivity: user.reports
    };

    return NextResponse.json(profileData);

  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
