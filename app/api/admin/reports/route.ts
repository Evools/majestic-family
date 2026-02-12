import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET: Fetch all pending reports
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reports = await prisma.report.findMany({
      where: { status: "PENDING" }, // Using string for now if enum causes issues, but strict mode should use ReportStatus.PENDING
      include: {
        user: {
          select: { name: true, image: true, firstName: true, lastName: true },
        },
        userContract: {
          include: {
            contract: true,
          },
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, firstName: true, lastName: true, image: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Approve or Reject report
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { reportId, action, value, rejectionReason } = body; // action: 'approve' | 'reject'

    if (!reportId || !action) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (action === "approve") {
      const totalValue = parseFloat(value);
      if (isNaN(totalValue) || totalValue < 0) {
        return NextResponse.json({ error: "Invalid value" }, { status: 400 });
      }

      // Get system settings for share percentages
      const settings = await prisma.systemSettings.findFirst();
      const userSharePercent = settings?.userSharePercent || 60;
      const familySharePercent = settings?.familySharePercent || 40;

      const totalUserShare = totalValue * (userSharePercent / 100);
      const familyShare = totalValue * (familySharePercent / 100);

      // Get all participants for this report
      const participants = await prisma.reportParticipant.findMany({
        where: { reportId },
      });

      if (participants.length === 0) {
        return NextResponse.json({ error: "No participants found. Add at least one participant before approving." }, { status: 400 });
      }

      // Calculate individual share (split equally among participants)
      const individualShare = totalUserShare / participants.length;

      // Update report and create participant shares in a transaction
      const report = await prisma.$transaction(async (tx) => {
        // Get the report to find userContractId
        const existingReport = await tx.report.findUnique({
          where: { id: reportId },
          select: { userContractId: true }
        });

        // If there's a userContract, mark it as COMPLETED
        if (existingReport?.userContractId) {
          await tx.userContract.update({
            where: { id: existingReport.userContractId },
            data: {
              status: 'COMPLETED',
              completedAt: new Date(),
            },
          });
        }

        // Update all participant shares
        await Promise.all(
          participants.map((participant) =>
            tx.reportParticipant.update({
              where: { id: participant.id },
              data: { share: individualShare },
            })
          )
        );

        // Update report
        return tx.report.update({
          where: { id: reportId },
          data: {
            status: 'APPROVED',
            value: totalValue,
            userShare: totalUserShare,
            familyShare,
            verifierId: session.user.id,
          },
        });
      });

      return NextResponse.json({ success: true, report });

    } else if (action === "reject") {
      if (!rejectionReason) {
        return NextResponse.json({ error: "Rejection reason required" }, { status: 400 });
      }

      const report = await prisma.report.update({
        where: { id: reportId },
        data: {
          status: 'REJECTED',
          rejectionReason,
          verifierId: session.user.id,
        },
      });
      return NextResponse.json({ success: true, report });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("Error processing report:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
