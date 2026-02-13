import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NavigationGrid } from "@/components/admin/navigation-grid";
import { RecentActivity } from "@/components/admin/recent-activity";
import { RefreshButton } from "@/components/admin/refresh-button";
import { StatsCards } from "@/components/admin/stats-cards";
import { getAdminStats } from "@/lib/services/admin";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
    redirect('/');
  }

  const stats = await getAdminStats();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Панель управления</h1>
            <p className="text-gray-400 mt-1">Центр управления семьей Shelby.</p>
        </div>
        <div className="flex items-center gap-3">
             <RefreshButton />
             <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold text-green-500 uppercase tracking-wider">Система активна</span>
            </div>
        </div>
      </div>

      {/* Quick Stats */}
      <StatsCards stats={stats} loading={false} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation Grid */}
        <NavigationGrid stats={stats} />

        {/* Recent Activity / Sidebar */}
        <RecentActivity stats={stats} loading={false} />
      </div>
    </div>
  );
}

