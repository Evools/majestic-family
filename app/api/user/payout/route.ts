import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// POST: Request a payout
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { amount } = body;

    const requestAmount = parseFloat(amount);
    if (isNaN(requestAmount) || requestAmount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Get system settings for min withdrawal
    const settings = await prisma.systemSettings.findFirst();
    const minWithdrawal = settings?.minWithdrawal || 10000;

    if (requestAmount < minWithdrawal) {
      return NextResponse.json({ error: `Минимальная сумма вывода: $${minWithdrawal.toLocaleString()}` }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        reports: {
          where: { status: 'APPROVED' },
          select: { userShare: true }
        },
        payoutRequests: {
          where: { status: { not: 'REJECTED' } },
          select: { amount: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate available balance
    const totalEarned = user.reports.reduce((sum, Report) => sum + (Report.userShare || 0), 0);
    const totalWithdrawnOrPending = user.payoutRequests.reduce((sum, req) => sum + req.amount, 0);
    const availableBalance = totalEarned - totalWithdrawnOrPending;

    if (requestAmount > availableBalance) {
      return NextResponse.json({ error: "Недостаточно средств" }, { status: 400 });
    }

    // Create payout request
    const payoutRequest = await prisma.payoutRequest.create({
      data: {
        userId: user.id,
        amount: requestAmount,
        status: 'PENDING'
      }
    });

    return NextResponse.json({ success: true, payoutRequest });

  } catch (error) {
    console.error("Error creating payout request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// GET: Fetch payout history and balance
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
          where: { status: 'APPROVED' },
          select: { userShare: true }
        },
        payoutRequests: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const totalEarned = user.reports.reduce((sum, r) => sum + (r.userShare || 0), 0);
    const totalWithdrawnOrPending = user.payoutRequests
      .filter(req => req.status !== 'REJECTED')
      .reduce((sum, req) => sum + req.amount, 0);

    const availableBalance = totalEarned - totalWithdrawnOrPending;

    return NextResponse.json({
      availableBalance,
      totalEarned,
      payouts: user.payoutRequests
    });

  } catch (error) {
    console.error("Error fetching payout data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
