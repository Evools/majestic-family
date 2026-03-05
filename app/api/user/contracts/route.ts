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

    // Lazy Cleanup: Mark active contracts older than 24h as CANCELLED to prevent stalling
    const staleThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await prisma.userContract.updateMany({
      where: {
        status: 'ACTIVE',
        startedAt: { lt: staleThreshold }
      },
      data: {
        status: 'CANCELLED',
        completedAt: new Date()
      }
    });

    const allContracts = await prisma.contract.findMany({
      where: { isActive: true }
    });

    const settings = await prisma.systemSettings.findFirst();
    const globalCooldownHours = settings?.contractCooldownHours ?? 24;

    const contractsWithCycle = await Promise.all(allContracts.map(async (c) => {
      let alreadyParticipated = false;

      // Participation check
      if (c.isFlexible) {
        const activeParticipation = await prisma.userContract.findFirst({
          where: {
            userId: user.id,
            contractId: c.id,
            status: 'ACTIVE'
          }
        });

        if (activeParticipation) {
          alreadyParticipated = true;
        } else {
          const recentCompletion = await prisma.userContract.findFirst({
            where: {
              userId: user.id,
              contractId: c.id,
              status: 'COMPLETED',
              completedAt: {
                gt: new Date(Date.now() - globalCooldownHours * 60 * 60 * 1000)
              }
            }
          });
          alreadyParticipated = !!recentCompletion;
        }
      } else {
        const participation = await prisma.userContract.findFirst({
          where: {
            userId: user.id,
            contractId: c.id,
            cycleNumber: c.currentCycle,
            status: { in: ['ACTIVE', 'COMPLETED'] }
          }
        });
        alreadyParticipated = !!participation;
      }

      const cycleCount = await prisma.userContract.count({
        where: {
          contractId: c.id,
          status: { in: ['ACTIVE', 'COMPLETED'] },
          cycleNumber: c.currentCycle
        }
      });

      // Aggregate total quantity of items submitted in this cycle
      const reportsAgg = await prisma.report.aggregate({
        where: {
          userContract: {
            contractId: c.id,
            cycleNumber: c.currentCycle
          },
          status: 'APPROVED'
        },
        _sum: {
          quantity: true
        }
      });
      const totalQuantity = reportsAgg._sum.quantity || 0;

      const activeParticipants = await prisma.userContract.findMany({
        where: {
          contractId: c.id,
          status: 'ACTIVE',
          cycleNumber: c.currentCycle
        },
        include: {
          user: {
            select: { id: true, name: true, firstName: true, lastName: true, image: true }
          }
        }
      });

      return { ...c, cycleCount, totalQuantity, alreadyParticipated, activeParticipants, targetGoal: (c as any).targetGoal };
    }));


    // Get user's contracts with report status
    const userContracts = await prisma.userContract.findMany({
      where: { userId: user.id },
      include: {
        contract: true,
        reports: {
          select: { status: true, id: true }
        }
      },
      orderBy: { startedAt: 'desc' },
    });

    // Separate active and completed
    // INCLUDE contracts that have a PENDING report in the active list so users can see them
    const active = userContracts.filter(uc => uc.status === 'ACTIVE');
    const completed = userContracts.filter(uc => uc.status === 'COMPLETED');

    const cooldownHours = settings?.contractCooldownHours ?? 24;
    const maxActiveContracts = settings?.maxActiveContracts ?? 10;

    return NextResponse.json({
      active,
      completed,
      cooldownHours,
      maxActiveContracts,
      availableContracts: contractsWithCycle
    });
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

    // NEW: Global Cooldown Check
    if (contract.cooldownUntil && new Date() < contract.cooldownUntil) {
      const remainingMs = contract.cooldownUntil.getTime() - Date.now();
      const hours = Math.floor(remainingMs / (60 * 60 * 1000));
      const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));

      return NextResponse.json({
        error: "Contract is on global cooldown",
        remainingTime: remainingMs,
        message: `Контракт на глобальной перезарядке. Доступен через ${hours}ч ${minutes}м.`
      }, { status: 400 });
    }

    // NEW: Global Slots and Participation Check
    const cycleParticipantsCount = await prisma.userContract.count({
      where: {
        contractId,
        status: { in: ['ACTIVE', 'COMPLETED'] },
        cycleNumber: contract.currentCycle
      }
    });

    if (!contract.isFlexible && cycleParticipantsCount >= contract.maxSlots) {
      return NextResponse.json({
        error: "Contract is full",
        message: "Все доступные места на этот цикл заняты. Дождитесь завершения выполнения всеми участниками или следующего цикла."
      }, { status: 400 });
    }

    // Check if user already participated
    if (contract.isFlexible) {
      // For flexible: check if active OR recently completed within cooldown
      const settings = await prisma.systemSettings.findFirst();
      const cooldownHours = settings?.contractCooldownHours ?? 24;

      const existingParticipation = await prisma.userContract.findFirst({
        where: {
          userId: user.id,
          contractId,
          OR: [
            { status: 'ACTIVE' },
            {
              status: 'COMPLETED',
              completedAt: {
                gt: new Date(Date.now() - cooldownHours * 60 * 60 * 1000)
              }
            }
          ]
        }
      });

      if (existingParticipation) {
        const errorMsg = existingParticipation.status === 'ACTIVE'
          ? "Вы уже взяли этот контракт."
          : `Вы недавно выполняли этот контракт. Он будет доступен через время отката.`;

        return NextResponse.json({
          error: "Already participated",
          message: errorMsg
        }, { status: 400 });
      }
    } else {
      // Standard: check participation in THIS cycle
      const userParticipation = await prisma.userContract.findFirst({
        where: {
          userId: user.id,
          contractId,
          cycleNumber: contract.currentCycle,
          status: { in: ['ACTIVE', 'COMPLETED'] }
        }
      });

      if (userParticipation) {
        return NextResponse.json({
          error: "Already participated",
          message: "Вы уже участвовали в выполнении этого контракта в текущем цикле. Дождитесь следующего обновления или выберите другое задание."
        }, { status: 400 });
      }
    }

    // Check if user already has this contract active
    const activeCountList = await prisma.userContract.findMany({
      where: {
        userId: user.id,
        status: 'ACTIVE',
      },
      include: {
        contract: true
      }
    });

    const isAlreadyActive = activeCountList.some(uc => uc.contractId === contractId);
    if (isAlreadyActive) {
      return NextResponse.json({ error: "You already have this contract active" }, { status: 400 });
    }

    // Check category restriction: Global lock per category (except "General")
    if (contract.category && contract.category !== "General") {
      const anyActiveInCategory = await prisma.userContract.findFirst({
        where: {
          status: 'ACTIVE',
          contract: {
            category: contract.category,
            id: { not: contractId } // Different contract in same category
          }
        },
        include: {
          contract: true
        }
      });

      if (anyActiveInCategory) {
        return NextResponse.json({
          error: "Category already active",
          message: `В вашей семье уже активирован другой контракт в категории "${contract.category}" (${anyActiveInCategory.contract.title}). Вы можете присоединиться к нему, но не можете начать новый, пока текущий не будет выполнен.`
        }, { status: 400 });
      }
    }

    // Check active contract limit
    const settings = await prisma.systemSettings.findFirst();
    const maxActiveContracts = settings?.maxActiveContracts ?? 10;

    if (activeCountList.length >= maxActiveContracts) {
      return NextResponse.json({ error: `Maximum ${maxActiveContracts} active contracts allowed` }, { status: 400 });
    }

    // Create user contract
    const userContract = await prisma.userContract.create({
      data: {
        userId: user.id,
        contractId,
        status: 'ACTIVE',
        cycleNumber: contract.currentCycle,
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
