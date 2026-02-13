import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// POST: Add participant to a report
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await req.json();
    const { id: reportId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Check if report exists and is still pending
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (report.status !== 'PENDING') {
      return NextResponse.json({ error: "Can only add participants to pending reports" }, { status: 400 });
    }

    // Check if participant already exists
    const existing = await prisma.reportParticipant.findUnique({
      where: {
        reportId_userId: {
          reportId,
          userId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Participant already added" }, { status: 400 });
    }

    // Add participant
    const participant = await prisma.reportParticipant.create({
      data: {
        reportId,
        userId,
        share: 0, // Will be calculated on approval
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(participant);
  } catch (error) {
    console.error("Error adding participant:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Remove participant from a report
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const { id: reportId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Check if report is still pending
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (report.status !== 'PENDING') {
      return NextResponse.json({ error: "Can only remove participants from pending reports" }, { status: 400 });
    }

    // Remove participant
    await prisma.reportParticipant.delete({
      where: {
        reportId_userId: {
          reportId,
          userId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing participant:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
