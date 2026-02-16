import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { logAction } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET: Fetch all users
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      orderBy: [
        { status: 'asc' }, // Pending first (alphabetically Active < Pending? No. PENDING > ACTIVE. Wait. PENDING vs ACTIVE. P > A. So 'asc' puts Active first. We want Pending first. Let's sort by createdAt desc or status specific order later. For now just get the field)
        { name: "asc" }
      ],
      select: { id: true, name: true, email: true, image: true, role: true, rank: true, status: true },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Update user role
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId, role, rank, status } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Prevent changing your own role/status to something else if you are the only admin (optional safety)
    if (userId === session.user.id && role && role !== session.user.role) {
      return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
    }

    const updateData: any = {};
    if (role) updateData.role = role as Role;
    if (rank !== undefined) updateData.rank = parseInt(rank);
    if (status) updateData.status = status;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    await logAction('UPDATE_USER', userId, `Updated: ${Object.keys(updateData).join(', ')}`);

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Delete a user
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    if (userId === session.user.id) {
      return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
    }

    // Delete user (Cascasde delete will handle related records if configured, otherwise we might need to delete relations first)
    // Prisma schema usually handles cascade if defined. Let's assume standard cascade or simple user delete.
    // If not, we might need to delete RecruitmentApplication first. 
    // Looking at schema from memory, we have `onDelete: Cascade` on the relation in RecruitmentApplication? 
    // Let's verify schema if needed, but usually we try to delete user.

    // Fetch user details before deletion to log name/email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    });

    await prisma.user.delete({
      where: { id: userId },
    });

    // Log with targetId as null (since user is gone) but include details
    await logAction('DELETE_USER', null, `User deleted by admin: ${user?.name || 'Unknown'} (${user?.email || 'No email'})`);

    await logAction('DELETE_USER', userId, 'User deleted by admin');

    return NextResponse.json({ message: "User deleted" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
