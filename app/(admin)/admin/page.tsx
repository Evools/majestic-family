'use client';

import { NavigationGrid } from "@/components/admin/navigation-grid";
import { RecentActivity } from "@/components/admin/recent-activity";
import { StatsCards } from "@/components/admin/stats-cards";
import { AdminStats } from "@/types/admin";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch admin stats:', error);
        } finally {
            setLoading(false);
        }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Панель управления</h1>
            <p className="text-gray-400 mt-1">Центр управления семьей Shelby.</p>
        </div>
        <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-green-500 uppercase tracking-wider">Система активна</span>
        </div>
      </div>

      {/* Quick Stats */}
      <StatsCards stats={stats} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation Grid */}
        <NavigationGrid stats={stats} />

        {/* Recent Activity / Sidebar */}
        <RecentActivity stats={stats} loading={loading} />
      </div>
    </div>
  );
}

