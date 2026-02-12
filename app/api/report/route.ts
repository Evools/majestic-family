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

    // Create report and add creator as first participant in a transaction
    const report = await prisma.$transaction(async (tx) => {
      const newReport = await tx.report.create({
        data: {
          userId: user.id,
          userContractId: userContract.id,
          contractType: userContract.contract.title, // Use contract title as type
          itemName,
          quantity: parseInt(quantity),
          proof,
          comment,
        },
      });

      // Automatically add creator as first participant
      await tx.reportParticipant.create({
        data: {
          reportId: newReport.id,
          userId: user.id,
          share: 0, // Will be calculated on approval
        },
      });

      return newReport;
    });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
