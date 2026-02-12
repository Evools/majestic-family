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
    const { contractType, itemName, quantity, proof, comment } = body;

    if (!contractType || !itemName || !quantity || !proof) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const report = await prisma.report.create({
      data: {
        userId: user.id,
        contractType,
        itemName,
        quantity: parseInt(quantity),
        proof,
        comment,
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
