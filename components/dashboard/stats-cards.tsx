import { Card, CardContent } from '@/components/ui/card';
import { BestEmployee, DashboardSettings } from '@/types/dashboard';
import { Crown, Target, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
    settings: DashboardSettings;
    bestEmployee: BestEmployee | null;
    bestEmployeeEarnings: number;
    xpPercentage: number;
    goalPercentage: number;
}

export function StatsCards({
    settings,
    bestEmployee,
    bestEmployeeEarnings,
    xpPercentage,
    goalPercentage
}: StatsCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Financial Goal */}
            <Card className="bg-[#0a0a0a] border border-[#1f1f1f] hover:border-[#e81c5a]/50 transition-colors group cursor-pointer">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-400 font-medium">Финансовая цель</h3>
                        <Target className="w-5 h-5 text-[#e81c5a]" />
                    </div>
                    <div className="mb-4">
                        <p className="text-xl font-bold text-white mb-1 group-hover:text-[#e81c5a] transition-colors">
                            {settings.goalName || 'Не установлена'}
                        </p>
                        <p className="text-sm text-gray-500">
                            Собрано ${(settings.goalCurrent || 0).toLocaleString()} из ${(settings.goalTarget || 0).toLocaleString()}
                        </p>
                    </div>
                    <div className="h-1.5 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
                        <div className="h-full bg-[#e81c5a]" style={{ width: `${goalPercentage}%` }} />
                    </div>
                </CardContent>
            </Card>

            {/* Best Employee */}
            <Card className="bg-[#0a0a0a] border border-[#1f1f1f] hover:border-[#e81c5a]/50 transition-colors group cursor-pointer">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-400 font-medium">Лучший сотрудник</h3>
                        <Crown className="w-5 h-5 text-yellow-500" />
                    </div>
                    {bestEmployee ? (
                        <div className="flex items-center gap-3">
                            {bestEmployee.image ? (
                                <img src={bestEmployee.image} alt="" className="w-10 h-10 rounded-full border border-white/10" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-linear-to-br from-gray-700 to-gray-900 border border-white/10" />
                            )}
                            <div>
                                <p className="font-bold text-white">{bestEmployee.firstName || bestEmployee.name}</p>
                                <p className="text-xs text-yellow-500 font-mono">${bestEmployeeEarnings.toLocaleString()} заработано</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">Нет данных</p>
                    )}
                </CardContent>
            </Card>

            {/* Family Level */}
            <Card className="bg-[#0a0a0a] border border-[#1f1f1f] hover:border-[#e81c5a]/50 transition-colors group cursor-pointer">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-400 font-medium">Уровень семьи</h3>
                        <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-white font-bold text-xl">{settings.familyLevel} Lvl</span>
                            <span className="text-gray-400 font-mono">{xpPercentage}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: `${xpPercentage}%` }} />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            До следующего уровня {settings.familyXPRequired - settings.familyXP} XP
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
