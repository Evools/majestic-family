import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AdminStats } from "@/types/admin";
import { Clock } from "lucide-react";
import Link from "next/link";

interface RecentActivityProps {
    stats: AdminStats | null;
    loading: boolean;
}

export function RecentActivity({ stats, loading }: RecentActivityProps) {
    return (
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
                            {stats.recentReports.map((report) => (
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
    );
}
