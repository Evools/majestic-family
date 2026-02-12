import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET: Get user's contracts (active and completed)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's contracts
    const userContracts = await prisma.userContract.findMany({
      where: { userId: user.id },
      include: {
        contract: true,
      },
      orderBy: { startedAt: 'desc' },
    });

    // Separate active and completed
    const active = userContracts.filter(uc => uc.status === 'ACTIVE');
    const completed = userContracts.filter(uc => uc.status === 'COMPLETED');

    return NextResponse.json({ active, completed });
  } catch (error) {
    console.error("Error fetching user contracts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Take a contract (assign to user)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { contractId } = await req.json();

    if (!contractId) {
      return NextResponse.json({ error: "Missing contractId" }, { status: 400 });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if contract exists and is active
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    if (!contract.isActive) {
      return NextResponse.json({ error: "Contract is not active" }, { status: 400 });
    }

    // Check if user already has this contract active
    const existingActive = await prisma.userContract.findFirst({
      where: {
        userId: user.id,
        contractId,
        status: 'ACTIVE',
      },
    });

    if (existingActive) {
      return NextResponse.json({ error: "You already have this contract active" }, { status: 400 });
    }

    // Check active contract limit (max 3)
    const activeCount = await prisma.userContract.count({
      where: {
        userId: user.id,
        status: 'ACTIVE',
      },
    });

    if (activeCount >= 3) {
      return NextResponse.json({ error: "Maximum 3 active contracts allowed" }, { status: 400 });
    }

    // Create user contract
    const userContract = await prisma.userContract.create({
      data: {
        userId: user.id,
        contractId,
        status: 'ACTIVE',
      },
      include: {
        contract: true,
      },
    });

    return NextResponse.json(userContract);
  } catch (error) {
    console.error("Error taking contract:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
