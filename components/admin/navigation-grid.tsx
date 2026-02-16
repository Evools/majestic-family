import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AdminStats } from "@/types/admin";
import { ClipboardList, FileText, LayoutDashboard, LucideIcon, Settings, UserPlus, Users, Wallet } from "lucide-react";
import Link from "next/link";

interface AdminLink {
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
    stat?: string | null;
    statColor?: string;
}

interface NavigationGridProps {
    stats: AdminStats | null;
}

export function NavigationGrid({ stats }: NavigationGridProps) {
    const adminLinks: AdminLink[] = [
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
            title: "Заявки",
            description: "Проверка заявок на вступление.",
            href: "/admin/applications",
            icon: UserPlus,
            color: "text-orange-500",
            bgColor: "bg-orange-500/10",
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
        <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-gray-500" />
                Быстрый доступ
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {adminLinks.map((link) => (
                    <Link key={link.href} href={link.href} className="group block h-full">
                        <Card className="h-full bg-[#0a0a0a] border-[#1f1f1f] hover:border-white/10 hover:bg-[#121212] transition-all cursor-pointer">
                            <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                                <div className={`w-10 h-10 rounded-lg ${link.bgColor} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                                    <link.icon className={`h-5 w-5 ${link.color}`} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white group-hover:text-white transition-colors">
                                        {link.title}
                                    </h3>
                                    {link.stat && (
                                        <span className={cn("text-[10px] font-bold uppercase tracking-wider block mt-1", link.statColor)}>
                                            {link.stat}
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
