import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await prisma.user.update({
      where: { email: session.user.email },
      data: { lastActiveAt: new Date() },
    });
    return new NextResponse("OK");
  } catch (error) {
    console.error("Heartbeat error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
