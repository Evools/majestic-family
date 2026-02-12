import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// DELETE: Cancel a contract
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userContractId } = await params;

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify user owns this contract
    const userContract = await prisma.userContract.findFirst({
      where: {
        id: userContractId,
        userId: user.id,
      },
    });

    if (!userContract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    // Check if contract has pending reports
    const pendingReports = await prisma.report.count({
      where: {
        userContractId: userContract.id,
        status: 'PENDING',
      },
    });

    if (pendingReports > 0) {
      return NextResponse.json({
        error: "Нельзя отменить контракт, по которому есть ожидающие отчеты. Дождитесь их проверки или отклонения."
      }, { status: 400 });
    }

    // Update status to CANCELLED instead of deleting
    await prisma.userContract.update({
      where: { id: userContractId },
      data: {
        status: 'CANCELLED',
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error cancelling contract:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
