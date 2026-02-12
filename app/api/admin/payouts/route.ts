import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET: Fetch payouts with optional filtering
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "PENDING";

    const payouts = await prisma.payoutRequest.findMany({
      where: status !== 'ALL' ? { status: status as any } : {},
      include: {
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            image: true,
            staticId: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(payouts);
  } catch (error) {
    console.error("Error fetching admin payouts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Approve or Reject payout
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, action } = body; // action: 'approve' | 'reject'

    if (!id || !action) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const payout = await prisma.payoutRequest.findUnique({
      where: { id },
    });

    if (!payout) {
      return NextResponse.json({ error: "Payout request not found" }, { status: 404 });
    }

    if (payout.status !== 'PENDING') {
      return NextResponse.json({ error: "Request already processed" }, { status: 400 });
    }

    const updatedPayout = await prisma.payoutRequest.update({
      where: { id },
      data: {
        status: action === 'approve' ? 'PAID' : 'REJECTED',
      }
    });

    return NextResponse.json({ success: true, payout: updatedPayout });

  } catch (error) {
    console.error("Error processing payout:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
