import { prisma } from "@/lib/prisma";
import { AdminRecentReport, AdminStats } from "@/types/admin";

export async function getAdminStats(): Promise<AdminStats> {
  const [
    totalMembers,
    pendingReports,
    activeContracts,
    dashboardSettings,
    recentReportsData
  ] = await Promise.all([
    prisma.user.count(),
    prisma.report.count({ where: { status: 'PENDING' } }),
    prisma.userContract.count({ where: { status: 'ACTIVE' } }),
    prisma.dashboardSettings.findFirst(),
    prisma.report.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, firstName: true, lastName: true, image: true }
        }
      }
    })
  ]);

  // Map Prisma result to AdminRecentReport type
  const recentReports: AdminRecentReport[] = recentReportsData.map(report => ({
    id: report.id,
    itemName: report.itemName,
    quantity: report.quantity,
    status: report.status as 'PENDING' | 'APPROVED' | 'REJECTED',
    createdAt: report.createdAt.toISOString(),
    user: {
      id: report.user.id,
      name: report.user.name,
      firstName: report.user.firstName,
      lastName: report.user.lastName
    }
  }));

  return {
    totalMembers,
    pendingReports,
    activeContracts,
    familyBalance: dashboardSettings?.familyBalance || 0,
    recentReports
  };
}
