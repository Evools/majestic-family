import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { BentoGrid } from '@/components/dashboard/bento-grid';
import { WelcomeBanner } from '@/components/dashboard/welcome-banner';
import { prisma } from '@/lib/prisma';
import { BestEmployee, DashboardSettings } from '@/types/dashboard';
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

  // Calculate user personal stats
  const userStatsRaw = await prisma.report.findMany({
      where: {
          userId: user?.id,
          status: 'APPROVED'
      },
      select: {
          userShare: true,
      }
  });

  const userStats = {
      earned: userStatsRaw.reduce((sum, r) => sum + (r.userShare || 0), 0),
      reports: userStatsRaw.length
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <WelcomeBanner displayName={displayName} />

      {/* Bento Grid layout */}
      <BentoGrid 
        settings={settings}
        bestEmployee={bestEmployee}
        bestEmployeeEarnings={bestEmployeeEarnings}
        xpPercentage={xpPercentage}
        goalPercentage={goalPercentage}
        userStats={userStats}
      />
    </div>
  );
}
