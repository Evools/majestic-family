import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "all"; // 'all' | 'month'

    let dateFilter = {};
    if (period === 'month') {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = {
        createdAt: {
          gte: firstDay
        }
      };
    }

    // Top Earners (Farm) - based on approved reports value
    const topEarners = await prisma.report.groupBy({
      by: ['userId'],
      where: {
        status: 'APPROVED',
        ...dateFilter
      },
      _sum: {
        userShare: true,
      },
      orderBy: {
        _sum: {
          userShare: 'desc',
        },
      },
      take: 10,
    });

    // Top Activity - based on approved reports count
    const topActivity = await prisma.report.groupBy({
      by: ['userId'],
      where: {
        status: 'APPROVED',
        ...dateFilter
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    // Fetch user details for these IDs
    const userIds = new Set([
      ...topEarners.map(e => e.userId),
      ...topActivity.map(a => a.userId)
    ]);

    const users = await prisma.user.findMany({
      where: {
        id: { in: Array.from(userIds) }
      },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        image: true,
        staticId: true
      }
    });

    // Map user details back to stats
    const leaderboard = {
      farm: topEarners.map(e => {
        const user = users.find(u => u.id === e.userId);
        return {
          user,
          value: e._sum.userShare || 0
        };
      }),
      activity: topActivity.map(a => {
        const user = users.find(u => u.id === a.userId);
        return {
          user,
          count: a._count.id || 0
        };
      })
    };

    return NextResponse.json(leaderboard);

  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
