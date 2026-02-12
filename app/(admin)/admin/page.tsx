'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
    Activity,
    ClipboardList,
    Clock,
    CreditCard,
    FileText,
    LayoutDashboard,
    Settings,
    Users,
    Wallet
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type AdminStats = {
    totalMembers: number;
    pendingReports: number;
    activeContracts: number;
    familyBalance: number;
    recentReports: any[];
};

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

  const adminLinks = [
    {
      title: "Отчеты",
      description: "Проверка и одобрение отчетов участников.",
      href: "/admin/reports",
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      stat: stats?.pendingReports ? `${stats.pendingReports} ожидают` : null,
      statColor: "text-blue-400"
    },
    {
      title: "Контракты",
      description: "Управление доступными контрактами.",
      href: "/admin/contracts",
      icon: ClipboardList,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      stat: stats?.activeContracts ? `${stats.activeContracts} активных` : null,
      statColor: "text-green-400"
    },
    {
      title: "Участники",
      description: "Управление составом и ролями.",
      href: "/admin/users",
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      stat: stats?.totalMembers?.toString(),
      statColor: "text-purple-400"
    },
    {
      title: "Выплаты",
      description: "Запросы на вывод средств.",
      href: "/admin/payouts",
      icon: Wallet,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Дашборд",
      description: "Настройка главной страницы.",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      color: "text-[#e81c5a]",
      bgColor: "bg-[#e81c5a]/10",
    },
    {
      title: "Настройки",
      description: "Системные настройки.",
      href: "/admin/settings",
      icon: Settings,
      color: "text-gray-500",
      bgColor: "bg-gray-500/10",
    },
  ];

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#0a0a0a] border-[#1f1f1f] overflow-hidden relative group">
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6 relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                        <FileText className="w-6 h-6" />
                    </div>
                    {stats?.pendingReports ? (
                        <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                            Требуют внимания
                        </span>
                    ) : null}
                </div>
                <div className="text-3xl font-black text-white tracking-tight">
                    {loading ? "..." : stats?.pendingReports || 0}
                </div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                    Ожидают проверки
                </p>
            </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a] border-[#1f1f1f] overflow-hidden relative group">
            <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6 relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                        <Users className="w-6 h-6" />
                    </div>
                </div>
                <div className="text-3xl font-black text-white tracking-tight">
                    {loading ? "..." : stats?.totalMembers || 0}
                </div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                    Всего участников
                </p>
            </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a] border-[#1f1f1f] overflow-hidden relative group">
            <div className="absolute inset-0 bg-linear-to-br from-green-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6 relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
                        <CreditCard className="w-6 h-6" />
                    </div>
                </div>
                <div className="text-3xl font-black text-white tracking-tight">
                    {loading ? "..." : `$${stats?.familyBalance.toLocaleString() || 0}`}
                </div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                    Баланс семьи
                </p>
            </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a] border-[#1f1f1f] overflow-hidden relative group">
            <div className="absolute inset-0 bg-linear-to-br from-[#e81c5a]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6 relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-xl bg-[#e81c5a]/10 text-[#e81c5a]">
                        <Activity className="w-6 h-6" />
                    </div>
                </div>
                <div className="text-3xl font-black text-white tracking-tight">
                    {loading ? "..." : stats?.activeContracts || 0}
                </div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                    Активных контрактов
                </p>
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {adminLinks.map((link) => (
            <Link key={link.href} href={link.href} className="group">
                <Card className="h-full bg-[#0a0a0a] border border-[#1f1f1f] hover:border-white/20 transition-all cursor-pointer relative overflow-hidden">
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity ${link.bgColor.replace('/10', '')}`} />
                    <CardContent className="p-6 relative z-10">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl ${link.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <link.icon className={`h-6 w-6 ${link.color}`} />
                            </div>
                            {link.stat && (
                                <span className={cn("text-xs font-bold uppercase tracking-wider", link.statColor)}>
                                    {link.stat}
                                </span>
                            )}
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-white transition-colors">
                        {link.title}
                        </h3>
                        <p className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
                        {link.description}
                        </p>
                    </CardContent>
                </Card>
            </Link>
            ))}
        </div>

        {/* Recent Activity / Sidebar */}
        <div className="space-y-6">
            <Card className="bg-[#0a0a0a] border-[#1f1f1f] h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wider text-gray-400">
                        <Clock className="w-4 h-4" />
                        Последние отчеты
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {!loading && stats?.recentReports?.length ? (
                        <div className="divide-y divide-white/5">
                            {stats.recentReports.map((report: any) => (
                                <div key={report.id} className="p-4 flex items-center gap-3 hover:bg-white/5 transition-colors">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full shrink-0",
                                        report.status === 'PENDING' ? "bg-yellow-500" :
                                        report.status === 'APPROVED' ? "bg-green-500" : "bg-red-500"
                                    )} />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <p className="text-sm font-bold text-white truncate">
                                                {report.user.firstName ? `${report.user.firstName} ${report.user.lastName}` : report.user.name}
                                            </p>
                                            <span className="text-[10px] text-gray-600 uppercase tracking-wider ml-2">
                                                {new Date(report.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">
                                            {report.itemName} x{report.quantity}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <Link href="/admin/reports" className="block p-4 text-center text-xs font-bold text-gray-500 hover:text-white uppercase tracking-wider hover:bg-white/5 transition-colors">
                                Показать все
                            </Link>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500 text-sm">
                            Нет активности
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
