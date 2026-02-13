import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { BonusWidget } from '@/components/dashboard/bonus-widget';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { WelcomeBanner } from '@/components/dashboard/welcome-banner';
import { prisma } from '@/lib/prisma';
import { BestEmployee, DashboardSettings, RecentReport } from '@/types/dashboard';
import { getServerSession } from 'next-auth';

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  
  // Fetch user data to get firstName
  const user = session?.user?.email 
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { firstName: true, name: true, id: true }
      })
    : null;

  // Use firstName if available, otherwise fall back to Discord name
  const displayName = user?.firstName || session?.user?.name || 'Гость';

  // Fetch dashboard settings
  // Type assertion or data mapping might be needed if prisma type doesn't match exactly 
  // but usually they align if types are generated from prisma
  let settingsRaw = await prisma.dashboardSettings.findFirst();
  if (!settingsRaw) {
    settingsRaw = await prisma.dashboardSettings.create({ data: {} });
  }
  const settings: DashboardSettings = {
      bonusActive: settingsRaw.bonusActive,
      bonusTitle: settingsRaw.bonusTitle,
      bonusDescription: settingsRaw.bonusDescription,
      familyBalance: settingsRaw.familyBalance,
      familyLevel: settingsRaw.familyLevel,
      familyXP: settingsRaw.familyXP,
      familyXPRequired: settingsRaw.familyXPRequired,
      goalName: settingsRaw.goalName,
      goalCurrent: settingsRaw.goalCurrent,
      goalTarget: settingsRaw.goalTarget
  };

  // Fetch recent reports for activity feed
  const recentReportsRaw = await prisma.report.findMany({
    select: {
      id: true,
      itemName: true, // Changed from contractType
      status: true,
      createdAt: true,
      user: {
        select: {
          firstName: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 4,
  });
  
  const recentReports: RecentReport[] = recentReportsRaw.map(r => ({
      id: r.id,
      itemName: r.itemName,
      status: r.status,
      createdAt: r.createdAt,
      user: {
          firstName: r.user.firstName,
          name: r.user.name
      }
  }));

  // Calculate best employee (most approved reports value)
  const bestEmployeeRaw = await prisma.user.findFirst({
    where: {
      reports: {
        some: {
          status: 'APPROVED',
        },
      },
    },
    select: {
      firstName: true,
      name: true,
      image: true,
      reports: {
        where: {
          status: 'APPROVED',
        },
        select: {
          userShare: true,
        },
      },
    },
    orderBy: {
      reports: {
        _count: 'desc',
      },
    },
  });
  
  const bestEmployee: BestEmployee | null = bestEmployeeRaw ? {
      firstName: bestEmployeeRaw.firstName,
      name: bestEmployeeRaw.name,
      image: bestEmployeeRaw.image,
      reports: bestEmployeeRaw.reports
  } : null;

  const bestEmployeeEarnings = bestEmployee?.reports.reduce(
    (sum, report) => sum + (report.userShare || 0),
    0
  ) || 0;

  // Calculate XP percentage
  const xpPercentage = settings.familyXPRequired > 0
    ? Math.round((settings.familyXP / settings.familyXPRequired) * 100)
    : 0;

  // Calculate goal percentage
  const goalPercentage = settings.goalTarget && settings.goalTarget > 0
    ? Math.round(((settings.goalCurrent || 0) / settings.goalTarget) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <WelcomeBanner displayName={displayName} />

      {/* Featured Widgets */}
      <BonusWidget settings={settings} />

      {/* Info Cards */}
      <StatsCards 
        settings={settings}
        bestEmployee={bestEmployee}
        bestEmployeeEarnings={bestEmployeeEarnings}
        xpPercentage={xpPercentage}
        goalPercentage={goalPercentage}
      />
      
      {/* Activity Feed */}
      <ActivityFeed recentReports={recentReports} />
    </div>
  );
}
