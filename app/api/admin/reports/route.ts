import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendReportActionNotification } from "@/lib/discord";
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
    const { reportId, action, rejectionReason } = body; // action: 'approve' | 'reject'

    if (!reportId || !action) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (action === "approve") {
      // Get report with contract info
      const reportWithContract = await prisma.report.findUnique({
        where: { id: reportId },
        include: {
          userContract: {
            include: { contract: true }
          },
          participants: true
        }
      });

      if (!reportWithContract) {
        return NextResponse.json({ error: "Report not found" }, { status: 404 });
      }

      const contract = reportWithContract.userContract?.contract;
      if (!contract) {
        return NextResponse.json({ error: "Contract not found" }, { status: 400 });
      }

      const participants = reportWithContract.participants;
      if (participants.length === 0) {
        return NextResponse.json({ error: "No participants found. Add at least one participant before approving." }, { status: 400 });
      }

      // Check if any participant already has an approved report in this cycle
      const userContractCycle = reportWithContract.userContract;
      if (contract && userContractCycle) {
        const participantIds = participants.map(p => p.userId);
        
        const existingApprovedReports = await prisma.report.findMany({
          where: {
            id: { not: reportId }, // Exclude current report
            userContract: {
              contractId: contract.id,
              cycleNumber: userContractCycle.cycleNumber,
            },
            status: 'APPROVED',
            participants: {
              some: {
                userId: { in: participantIds }
              }
            }
          },
          include: {
            participants: {
              where: { userId: { in: participantIds } },
              select: { userId: true }
            }
          }
        });

        if (existingApprovedReports.length > 0) {
          const conflictingUsers = new Set<string>();
          existingApprovedReports.forEach(r => {
            r.participants.forEach(p => {
              conflictingUsers.add(p.userId);
            });
          });
          
          return NextResponse.json({ 
            error: `Участник(и) уже сдали отчет в этом цикле и не могут быть одобрены повторно: ${Array.from(conflictingUsers).join(', ')}`
          }, { status: 400 });
        }
      }

      // Get system settings for share percentages
      const settings = await prisma.systemSettings.findFirst();
      const userSharePercent = settings?.userSharePercent || 60;
      const familySharePercent = settings?.familySharePercent || 40;

      // Calculate slot value (each participant occupies one slot)
      const slotValue = contract.reward / contract.maxSlots;
      
      // Each participant gets a fixed share per slot
      const userSlotShare = slotValue * (userSharePercent / 100);
      const familySlotShare = slotValue * (familySharePercent / 100);
      
      // Individual participant share (same for all in this report)
      const individualShare = userSlotShare;
      
      // Family share (multiplied by number of participants in this report)
      const familyShare = familySlotShare * participants.length;
      const totalUserShare = userSlotShare * participants.length;

      // Update report and create participant shares in a transaction
      const report = await prisma.$transaction(async (tx) => {
        // Get the report to find userContractId and all participants
        const existingReport = await tx.report.findUnique({
          where: { id: reportId },
          include: { participants: { select: { userId: true } } }
        });

        // Mark report creator's userContract as COMPLETED
        if (existingReport?.userContractId) {
          await tx.userContract.update({
            where: { id: existingReport.userContractId },
            data: {
              status: 'COMPLETED',
              completedAt: new Date(),
            },
          });
        }

        // Mark all participant userContracts as COMPLETED
        const participantUserIds = participants.map(p => p.userId);
        if (userContractCycle) {
          await tx.userContract.updateMany({
            where: {
              contractId: contract.id,
              cycleNumber: userContractCycle.cycleNumber,
              userId: { in: participantUserIds },
              status: 'ACTIVE' // Only update active ones
            },
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

        // Ensure all participants have a UserContract for this contract
        const existingUserContracts = await tx.userContract.findMany({
          where: {
            contractId: contract.id,
            userId: { in: participantUserIds },
            cycleNumber: userContractCycle?.cycleNumber
          }
        });

        const existingUserIds = new Set(existingUserContracts.map(uc => uc.userId));
        const missingUserIds = participantUserIds.filter(uid => !existingUserIds.has(uid));

        // Create UserContract for any participants who don't have one
        if (missingUserIds.length > 0) {
          await tx.userContract.createMany({
            data: missingUserIds.map(userId => ({
              userId,
              contractId: contract.id,
              status: 'COMPLETED' as const,
              cycleNumber: userContractCycle?.cycleNumber || contract.currentCycle,
              completedAt: new Date(),
            }))
          });
        }

        // Update dashboard settings (Family Balance and Goal progress)
        let dashboardSettings = await tx.dashboardSettings.findFirst();
        if (!dashboardSettings) {
          dashboardSettings = await tx.dashboardSettings.create({
            data: {
              familyBalance: familyShare,
              goalCurrent: familyShare
            }
          });
        } else {
          await tx.dashboardSettings.update({
            where: { id: dashboardSettings.id },
            data: {
              familyBalance: { increment: familyShare },
              goalCurrent: (dashboardSettings.goalCurrent || 0) + familyShare
            }
          });
        }

        // Update report
        const updatedReport = await tx.report.update({
          where: { id: reportId },
          data: {
            status: 'APPROVED',
            value: totalUserShare + familyShare,
            userShare: totalUserShare,
            familyShare,
            verifierId: session.user.id,
          },
          include: {
            userContract: {
              include: {
                contract: true
              }
            }
          }
        });

        // Global Cooldown Logic: Check if all slots are filled
        const userContract = updatedReport.userContract;
        if (userContract) {
          const contract = userContract.contract;

          // Count unique participants who have submitted approved reports in this cycle
          const participantsWithApprovedReports = await tx.reportParticipant.findMany({
            distinct: ['userId'],
            where: {
              report: {
                userContract: {
                  contractId: contract.id,
                  cycleNumber: contract.currentCycle
                },
                status: 'APPROVED'
              }
            },
            select: { userId: true }
          });

          const filledSlots = participantsWithApprovedReports.length;

          // End cycle if all max slots are filled
          const cycleComplete = filledSlots >= contract.maxSlots;

          if (cycleComplete) {
            const settings = await tx.systemSettings.findFirst();
            const cooldownHours = settings?.contractCooldownHours ?? 24;

            await tx.contract.update({
              where: { id: contract.id },
              data: {
                cooldownUntil: new Date(Date.now() + cooldownHours * 60 * 60 * 1000),
                currentCycle: { increment: 1 }
              }
            });
          }
        }


        return updatedReport;
      });

      // Send Notification (non-blocking)
      // Re-fetch report with user info for notification
      const reportForNotify = await prisma.report.findUnique({
        where: { id: report.id },
        include: { user: true }
      });

      if (reportForNotify) {
        sendReportActionNotification(reportForNotify, session.user, 'approve').catch(console.error);
      }

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
        include: { user: true }
      });

      // Send Notification (non-blocking)
      sendReportActionNotification(report, session.user, 'reject', rejectionReason).catch(console.error);

      return NextResponse.json({ success: true, report });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("Error processing report:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
