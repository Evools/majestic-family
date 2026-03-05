import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BestEmployee, DashboardSettings } from '@/types/dashboard';
import { ArrowRight, BookOpen, Briefcase, Coins, Crown, FileText, Flame, Target, TrendingUp, UserCheck, Zap } from 'lucide-react';
import Link from 'next/link';

interface BentoGridProps {
    settings: DashboardSettings;
    bestEmployee: BestEmployee | null;
    bestEmployeeEarnings: number;
    xpPercentage: number;
    goalPercentage: number;
    userStats: {
        earned: number;
        reports: number;
    };
}

export function BentoGrid({
    settings,
    bestEmployee,
    bestEmployeeEarnings,
    xpPercentage,
    goalPercentage,
    userStats
}: BentoGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr">
            
            {/* 1. Active Event / Bonus (Spans 2 columns) */}
            <Card className={`lg:col-span-2 relative overflow-hidden transition-all duration-300 border ${settings.bonusActive ? 'bg-linear-to-r from-[#e81c5a] to-[#7f1d1d] border-transparent hover:shadow-[0_0_30px_rgba(232,28,90,0.3)]' : 'bg-[#0a0a0a] border-[#1f1f1f] hover:border-gray-500/30'}`}>
                {settings.bonusActive ? (
                    <>
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Flame className="w-64 h-64 text-white transform rotate-12" />
                        </div>
                        <CardContent className="p-8 relative z-10 h-full flex flex-col justify-center">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10 shadow-sm">
                                    Активный бонус
                                </span>
                            </div>
                            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">{settings.bonusTitle || 'Специальное предложение'}</h2>
                            <p className="text-white/80 max-w-lg mb-8 text-sm font-medium">
                                {settings.bonusDescription || 'Следите за обновлениями!'}
                            </p>
                            <div className="mt-auto">
                                <Link href="/contracts">
                                    <Button className="bg-white text-[#e81c5a] hover:bg-white/90 font-black uppercase tracking-widest text-[10px] border-0">
                                        Перейти к контрактам <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </>
                ) : (
                    <CardContent className="p-8 flex flex-col items-center justify-center h-full text-center relative z-10">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Flame className="w-64 h-64 text-white transform rotate-12" />
                        </div>
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/5">
                            <Flame className="w-8 h-8 text-gray-600" />
                        </div>
                        <h2 className="text-xl font-black text-white mb-2">Активных бонусов нет</h2>
                        <p className="text-sm text-gray-500 max-w-sm">
                            На данный момент нет специальных заданий или бонусов. 
                            Следите за обновлениями!
                        </p>
                    </CardContent>
                )}
            </Card>

            {/* 2. Family Balance */}
            <Card className="bg-[#0a0a0a] border border-[#1f1f1f] hover:border-yellow-500/30 transition-all duration-300 group">
                <CardContent className="p-6 flex flex-col justify-center h-full text-center relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl group-hover:bg-yellow-500/10 transition-colors pointer-events-none" />
                    
                    <div className="w-14 h-14 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4 border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)] group-hover:scale-110 transition-transform duration-300">
                        <Coins className="w-6 h-6 text-yellow-500" />
                    </div>
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-500 group-hover:text-yellow-500/70 transition-colors mb-2">Баланс Семьи</h3>
                    <div className="text-2xl lg:text-3xl font-black text-white group-hover:text-yellow-500 transition-colors tracking-tight">
                        ${settings.familyBalance.toLocaleString()}
                    </div>
                </CardContent>
            </Card>

            {/* 3. Quick Actions */}
            <Card className="bg-[#0a0a0a] border border-[#1f1f1f] hover:border-purple-500/30 transition-colors group">
                <CardContent className="p-6 flex flex-col h-full space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-500 group-hover:text-purple-500/70 transition-colors">Квик меню</h3>
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-purple-500" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 grow justify-center">
                        <Link href="/contracts" className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent hover:border-purple-500/20 bg-white/5 hover:bg-purple-500/10 transition-all group/link">
                            <Briefcase className="w-4 h-4 text-purple-500 group-hover/link:animate-pulse" /> 
                            <span className="text-xs font-bold text-gray-300 group-hover/link:text-white">Взять контракт</span>
                        </Link>
                        <Link href="/report" className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent hover:border-[#e81c5a]/20 bg-white/5 hover:bg-[#e81c5a]/10 transition-all group/link">
                            <FileText className="w-4 h-4 text-[#e81c5a] group-hover/link:animate-pulse" /> 
                            <span className="text-xs font-bold text-gray-300 group-hover/link:text-white">Сдать отчет</span>
                        </Link>
                        <Link href="/wiki" className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent hover:border-blue-500/20 bg-white/5 hover:bg-blue-500/10 transition-all group/link">
                            <BookOpen className="w-4 h-4 text-blue-500 group-hover/link:animate-pulse" /> 
                            <span className="text-xs font-bold text-gray-300 group-hover/link:text-white">База знаний</span>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* 4. My Stats */}
            <Card className="bg-[#0a0a0a] border border-[#1f1f1f] hover:border-emerald-500/30 transition-all duration-300 group">
                <CardContent className="p-6 flex flex-col h-full justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-500 group-hover:text-emerald-500/70 transition-colors">Моя статистика</h3>
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <UserCheck className="w-4 h-4 text-emerald-500" />
                        </div>
                    </div>
                    <div>
                        <p className="text-2xl font-black text-white group-hover:text-emerald-500 transition-colors tracking-tight">
                            ${userStats.earned.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                            Выполнено {userStats.reports} отчетов
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* 5. Goal */}
            <Card className="bg-[#0a0a0a] border border-[#1f1f1f] hover:border-[#e81c5a]/30 transition-all duration-300 group">
                <CardContent className="p-6 flex flex-col h-full justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-500 group-hover:text-[#e81c5a]/70 transition-colors">Финансовая цель</h3>
                        <div className="w-8 h-8 rounded-lg bg-[#e81c5a]/10 flex items-center justify-center">
                            <Target className="w-4 h-4 text-[#e81c5a]" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white mb-2 line-clamp-1 group-hover:text-[#e81c5a] transition-colors">{settings.goalName || 'Не установлена'}</p>
                        <div className="h-1.5 w-full bg-[#1a1a1a] rounded-full overflow-hidden mb-2">
                            <div className="h-full bg-[#e81c5a] transition-all duration-1000" style={{ width: `${goalPercentage}%` }} />
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                            <span className="text-white">${(settings.goalCurrent || 0).toLocaleString()}</span>
                            <span>из ${(settings.goalTarget || 0).toLocaleString()}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 6. Best Employee */}
            <Card className="bg-[#0a0a0a] border border-[#1f1f1f] hover:border-amber-500/30 transition-all duration-300 group">
                <CardContent className="p-6 flex flex-col h-full justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-500 group-hover:text-amber-500/70 transition-colors">Топ сотрудник</h3>
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <Crown className="w-4 h-4 text-amber-500" />
                        </div>
                    </div>
                    {bestEmployee ? (
                        <div className="flex items-center gap-3">
                            {bestEmployee.image ? (
                                <img src={bestEmployee.image} alt="" className="w-10 h-10 rounded-full border border-white/10 group-hover:border-amber-500/50 transition-colors object-cover" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-linear-to-br from-amber-700 to-amber-900 border border-white/10 flex items-center justify-center text-xs font-bold text-white group-hover:border-amber-500/50 transition-colors shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                                    {bestEmployee.firstName?.[0] || bestEmployee.name?.[0] || '?'}
                                </div>
                            )}
                            <div className="min-w-0">
                                <p className="font-bold text-white text-sm truncate group-hover:text-amber-500 transition-colors">{bestEmployee.firstName || bestEmployee.name}</p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5"><span className="text-amber-500">${bestEmployeeEarnings.toLocaleString()}</span> за цикл</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center h-10">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Нет данных</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 7. Family Level */}
            <Card className="bg-[#0a0a0a] border border-[#1f1f1f] hover:border-green-500/30 transition-all duration-300 group">
                <CardContent className="p-6 flex flex-col h-full justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-500 group-hover:text-green-500/70 transition-colors">Уровень Семьи</h3>
                        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-2xl font-black text-white group-hover:text-green-500 transition-colors tracking-tight">{settings.familyLevel} LVL</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#1a1a1a] rounded-full overflow-hidden mb-2">
                            <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${xpPercentage}%` }} />
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                            <span className="text-white">{xpPercentage}%</span>
                            <span>Лимит: {settings.familyXPRequired} XP</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
