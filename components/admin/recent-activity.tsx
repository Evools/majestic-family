import { Card, CardContent } from "@/components/ui/card";
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
        <div className="h-full">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-gray-500" />
                Активность
            </h2>
            <Card className="bg-[#0a0a0a] border-[#1f1f1f] h-[calc(100%-3.5rem)]">
                <CardContent className="p-0 h-full flex flex-col">
                    {!loading && stats?.recentReports?.length ? (
                        <div className="divide-y divide-[#1f1f1f]">
                            {stats.recentReports.map((report) => (
                                <div key={report.id} className="p-4 flex items-center gap-3 hover:bg-white/5 transition-colors group">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full shrink-0 ring-4 ring-opacity-20 transition-all",
                                        report.status === 'PENDING' ? "bg-yellow-500 ring-yellow-500/10 group-hover:ring-yellow-500/30" :
                                            report.status === 'APPROVED' ? "bg-green-500 ring-green-500/10 group-hover:ring-green-500/30" : "bg-red-500 ring-red-500/10 group-hover:ring-red-500/30"
                                    )} />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <p className="text-sm font-bold text-white truncate">
                                                {report.user.firstName ? `${report.user.firstName} ${report.user.lastName}` : report.user.name}
                                            </p>
                                            <span className="text-[10px] text-gray-600 font-medium uppercase tracking-wider ml-2">
                                                {new Date(report.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">
                                            {report.itemName} <span className="text-gray-400">x{report.quantity}</span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <Link href="/admin/reports" className="mt-auto block p-4 text-center text-xs font-bold text-gray-500 hover:text-white uppercase tracking-wider hover:bg-white/5 transition-colors border-t border-[#1f1f1f]">
                                Показать все
                            </Link>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500">
                            <Clock className="w-8 h-8 opacity-20 mb-3" />
                            <p className="text-sm">Нет активности</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
