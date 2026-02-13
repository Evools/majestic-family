import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AdminStats } from "@/types/admin";
import { ClipboardList, FileText, LayoutDashboard, LucideIcon, Settings, Users, Wallet } from "lucide-react";
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
            title: "Настройки",
            description: "Системные настройки.",
            href: "/admin/settings",
            icon: Settings,
            color: "text-gray-500",
            bgColor: "bg-gray-500/10",
        },
    ];

    return (
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
    );
}
