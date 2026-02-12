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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // Optional status filter
    const limit = parseInt(searchParams.get("limit") || "50");

    const reports = await prisma.report.findMany({
      where: {
        userId: session.user.id,
        ...(status ? { status: status as any } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      select: {
        id: true,
        contractType: true,
        itemName: true,
        quantity: true,
        status: true,
        value: true,
        userShare: true,
        rejectionReason: true,
        createdAt: true,
        verifier: {
          select: {
            name: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Error fetching user reports:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
