import { Card, CardContent } from "@/components/ui/card";
import { AdminStats } from "@/types/admin";
import { Activity, CreditCard, FileText, Users } from "lucide-react";

interface StatsCardsProps {
    stats: AdminStats | null;
    loading: boolean;
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
    return (
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
    );
}
