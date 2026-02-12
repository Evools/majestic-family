import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const members = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        staticId: true,
        rank: true,
        roleName: true,
        lastActiveAt: true,
        image: true,
        email: true,
      },
      orderBy: {
        rank: 'desc'
      }
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
