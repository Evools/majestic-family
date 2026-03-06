import { sendNewReportNotification } from "@/lib/discord";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userContractId, itemName, quantity, proof, comment } = body;

    if (!userContractId || !itemName || !quantity || !proof) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify user owns this contract and it's active
    const userContract = await prisma.userContract.findFirst({
      where: {
        id: userContractId,
        userId: user.id,
        status: 'ACTIVE',
      },
      include: {
        contract: true,
      },
    });

    if (!userContract) {
      return NextResponse.json({ error: "Contract not found or not active" }, { status: 404 });
    }

    // Check if user already has approved reports in this cycle
    const allParticipantIds = [user.id];
    const existingApprovedReports = await prisma.report.findMany({
      where: {
        userContract: {
          contractId: userContract.contractId,
          cycleNumber: userContract.cycleNumber,
        },
        status: 'APPROVED',
        participants: {
          some: {
            userId: { in: allParticipantIds }
          }
        }
      },
      include: {
        participants: {
          select: { userId: true }
        }
      }
    });

    if (existingApprovedReports.length > 0) {
      const conflictingUsers = new Set<string>();
      existingApprovedReports.forEach(r => {
        r.participants.forEach(p => {
          if (allParticipantIds.includes(p.userId)) {
            conflictingUsers.add(p.userId);
          }
        });
      });
      
      const conflictingUserIds = Array.from(conflictingUsers);
      const conflictingUserNames = conflictingUserIds.length > 0 
        ? `(${conflictingUserIds.join(', ')})` 
        : '';
      
      return NextResponse.json({ 
        error: `Участник(и) уже сдали отчет в этом цикле контракта. Один участник может сдать максимум один отчет за цикл. ${conflictingUserNames}`,
        conflictingUserIds 
      }, { status: 400 });
    }

    // Create report and add creator as participant in a transaction
    const report = await prisma.$transaction(async (tx) => {
      const newReport = await tx.report.create({
        data: {
          userId: user.id,
          userContractId: userContract.id,
          contractType: userContract.contract.title, // Use contract title as type
          itemName,
          quantity: parseInt(quantity),
          // Handle proof: if array, join with comma; if string, use as is
          proof: Array.isArray(proof) ? proof.join(',') : proof,
          comment,
        },
      });

      // Add creator as participant
      await tx.reportParticipant.create({
        data: {
          reportId: newReport.id,
          userId: user.id,
          share: 0,
        },
      });

      return newReport;
    });

    // Send Discord Notification (non-blocking)
    sendNewReportNotification(report, user).catch((err: unknown) => console.error("Discord Notification error:", err));

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
