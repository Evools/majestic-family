import { Card, CardContent } from "@/components/ui/card";
import { AdminStats } from "@/types/admin";
import { Activity, CreditCard, FileText, Users } from "lucide-react";

interface StatsCardsProps {
    stats: AdminStats | null;
    loading: boolean;
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-[#0a0a0a] border-[#1f1f1f] hover:border-blue-500/30 transition-all group">
                <CardContent className="p-5">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Отчеты</p>
                            <div className="text-2xl font-bold text-white">
                                {loading ? "..." : stats?.pendingReports || 0}
                            </div>
                        </div>
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20 transition-colors">
                            <FileText className="w-5 h-5" />
                        </div>
                    </div>
                    {stats?.pendingReports ? (
                        <div className="mt-3 text-xs text-blue-400 font-medium">
                            {stats.pendingReports} требуют проверки
                        </div>
                    ) : (
                         <div className="mt-3 text-xs text-gray-600">
                            Все проверено
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="bg-[#0a0a0a] border-[#1f1f1f] hover:border-purple-500/30 transition-all group">
                <CardContent className="p-5">
                    <div className="flex justify-between items-start">
                        <div>
                             <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Участники</p>
                            <div className="text-2xl font-bold text-white">
                                {loading ? "..." : stats?.totalMembers || 0}
                            </div>
                        </div>
                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 group-hover:bg-purple-500/20 transition-colors">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                     <div className="mt-3 text-xs text-gray-600">
                         Всего в семье
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-[#0a0a0a] border-[#1f1f1f] hover:border-green-500/30 transition-all group">
                <CardContent className="p-5">
                    <div className="flex justify-between items-start">
                         <div>
                             <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Баланс</p>
                            <div className="text-2xl font-bold text-white">
                                {loading ? "..." : `$${stats?.familyBalance.toLocaleString() || 0}`}
                            </div>
                        </div>
                        <div className="p-2 rounded-lg bg-green-500/10 text-green-500 group-hover:bg-green-500/20 transition-colors">
                            <CreditCard className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3 text-xs text-green-400 font-medium">
                         Доступно
                    </div>
                </CardContent>
            </Card>

             <Card className="bg-[#0a0a0a] border-[#1f1f1f] hover:border-[#e81c5a]/30 transition-all group">
                <CardContent className="p-5">
                    <div className="flex justify-between items-start">
                        <div>
                             <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Контракты</p>
                            <div className="text-2xl font-bold text-white">
                                {loading ? "..." : stats?.activeContracts || 0}
                            </div>
                        </div>
                        <div className="p-2 rounded-lg bg-[#e81c5a]/10 text-[#e81c5a] group-hover:bg-[#e81c5a]/20 transition-colors">
                            <Activity className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-600">
                         Активны сейчас
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
