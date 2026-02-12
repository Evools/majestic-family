import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Users active in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const onlineUsers = await prisma.user.findMany({
      where: {
        lastActiveAt: {
          gte: fiveMinutesAgo,
        },
      },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        image: true,
        staticId: true,
        role: true,
      },
      orderBy: {
        lastActiveAt: 'desc',
      },
      take: 20,
    });

    return NextResponse.json(onlineUsers);
  } catch (error) {
    console.error("Online users fetch error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
