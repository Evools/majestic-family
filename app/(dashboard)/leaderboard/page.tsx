'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Calendar, Crown, Flame, TrendingUp, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';

type UserStat = {
    user: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        name: string | null;
        image: string | null;
    };
    value?: number;
    count?: number;
};

type LeaderboardData = {
    farm: UserStat[];
    activity: UserStat[];
};

export default function LeaderboardPage() {
    const [data, setData] = useState<LeaderboardData>({ farm: [], activity: [] });
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<'all' | 'month'>('all');
    const [category, setCategory] = useState<'farm' | 'activity'>('farm');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/stats/leaderboard?period=${period}`);
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [period]);

    const currentList = category === 'farm' ? data.farm : data.activity;
    const top3 = currentList.slice(0, 3);
    const rest = currentList.slice(3);

    const getDisplayName = (u: UserStat['user']) => u.firstName ? `${u.firstName} ${u.lastName || ''}` : u.name;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
             {/* Header */}
             <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-yellow-500" />
                        Зал Славы
                    </h1>
                    <p className="text-gray-400 mt-1">Лучшие члены семьи Shelby по эффективности.</p>
                </div>
                
                <div className="flex bg-[#0a0a0a] p-1 rounded-lg border border-white/10">
                    <button
                        onClick={() => setPeriod('all')}
                        className={cn(
                            "px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all",
                            period === 'all' ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-white"
                        )}
                    >
                        За все время
                    </button>
                    <button
                        onClick={() => setPeriod('month')}
                        className={cn(
                            "px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2",
                            period === 'month' ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-white"
                        )}
                    >
                        <Calendar className="w-3 h-3" />
                        Этот месяц
                    </button>
                </div>
            </div>

            {/* Category Switcher */}
            <div className="flex gap-4">
                 <Card 
                    className={cn(
                        "flex-1 cursor-pointer transition-all hover:border-[#e81c5a]/50 group relative overflow-hidden",
                        category === 'farm' ? "bg-[#e81c5a] border-[#e81c5a]" : "bg-[#0a0a0a] border-[#1f1f1f]"
                    )}
                    onClick={() => setCategory('farm')}
                 >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <TrendingUp className="w-24 h-24 text-white transform rotate-12" />
                    </div>
                    <CardContent className="p-6 relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                             <div className={cn("p-2 rounded-lg", category === 'farm' ? "bg-white/20 text-white" : "bg-green-500/10 text-green-500")}>
                                <TrendingUp className="w-6 h-6" />
                             </div>
                             <h3 className={cn("text-lg font-bold", category === 'farm' ? "text-white" : "text-gray-300 group-hover:text-white")}>Топ Фармил</h3>
                        </div>
                        <p className={cn("text-xs font-medium uppercase tracking-widest opacity-80", category === 'farm' ? "text-white" : "text-gray-500")}>
                            По заработанным деньгам
                        </p>
                    </CardContent>
                 </Card>

                 <Card 
                    className={cn(
                        "flex-1 cursor-pointer transition-all hover:border-[#e81c5a]/50 group relative overflow-hidden",
                        category === 'activity' ? "bg-[#e81c5a] border-[#e81c5a]" : "bg-[#0a0a0a] border-[#1f1f1f]"
                    )}
                    onClick={() => setCategory('activity')}
                 >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Flame className="w-24 h-24 text-white transform rotate-12" />
                    </div>
                    <CardContent className="p-6 relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                             <div className={cn("p-2 rounded-lg", category === 'activity' ? "bg-white/20 text-white" : "bg-orange-500/10 text-orange-500")}>
                                <Flame className="w-6 h-6" />
                             </div>
                             <h3 className={cn("text-lg font-bold", category === 'activity' ? "text-white" : "text-gray-300 group-hover:text-white")}>Топ Активистов</h3>
                        </div>
                        <p className={cn("text-xs font-medium uppercase tracking-widest opacity-80", category === 'activity' ? "text-white" : "text-gray-500")}>
                            По количеству отчетов
                        </p>
                    </CardContent>
                 </Card>
            </div>

            {loading ? (
                <div className="py-20 text-center">
                    <div className="inline-block w-8 h-8 border-2 border-[#e81c5a]/20 border-t-[#e81c5a] rounded-full animate-spin" />
                    <p className="text-gray-500 text-xs mt-4 uppercase tracking-widest">Загрузка данных...</p>
                </div>
            ) : currentList.length === 0 ? (
                <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl bg-[#0a0a0a]">
                    <Trophy className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                    <h3 className="text-gray-500 font-medium">Пока пусто</h3>
                    <p className="text-xs text-gray-600 mt-1 uppercase tracking-widest">Будьте первым, кто попадет в топ!</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Podium for Top 3 */}
                    <div className="flex flex-col md:flex-row items-end justify-center gap-4 min-h-[280px] px-4 pb-8 border-b border-white/5">
                        {/* 2nd Place */}
                        {top3[1] && (
                            <div className="order-2 md:order-1 flex flex-col items-center w-full md:w-1/3 animate-in slide-in-from-bottom-8 duration-700 delay-100">
                                <div className="relative mb-4">
                                    <div className="w-20 h-20 rounded-full border-4 border-gray-400 overflow-hidden">
                                        {top3[1].user.image ? (
                                            <img src={top3[1].user.image} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-800" />
                                        )}
                                    </div>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-400 text-black text-xs font-black px-2 py-0.5 rounded shadow-lg">#2</div>
                                </div>
                                <h3 className="text-white font-bold text-lg text-center">{getDisplayName(top3[1].user)}</h3>
                                <p className="text-gray-400 font-mono text-sm">
                                    {category === 'farm' ? `$${top3[1].value?.toLocaleString()}` : `${top3[1].count} отчетов`}
                                </p>
                                <div className="h-24 w-full bg-linear-to-t from-gray-500/20 to-transparent rounded-t-xl mt-4 mx-8" />
                            </div>
                        )}

                        {/* 1st Place */}
                         {top3[0] && (
                            <div className="order-1 md:order-2 flex flex-col items-center w-full md:w-1/3 z-10 animate-in slide-in-from-bottom-12 duration-700">
                                <Crown className="w-8 h-8 text-yellow-500 mb-2 animate-bounce" />
                                <div className="relative mb-4">
                                    <div className="w-28 h-28 rounded-full border-4 border-yellow-500 overflow-hidden shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                                        {top3[0].user.image ? (
                                            <img src={top3[0].user.image} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-800" />
                                        )}
                                    </div>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-sm font-black px-3 py-0.5 rounded shadow-lg">#1</div>
                                </div>
                                <h3 className="text-white font-black text-xl text-center shadow-black drop-shadow-lg">{getDisplayName(top3[0].user)}</h3>
                                <p className="text-yellow-500 font-mono font-bold text-lg">
                                    {category === 'farm' ? `$${top3[0].value?.toLocaleString()}` : `${top3[0].count} отчетов`}
                                </p>
                                <div className="h-32 w-full bg-linear-to-t from-yellow-500/20 to-transparent rounded-t-xl mt-4" />
                            </div>
                        )}

                        {/* 3rd Place */}
                        {top3[2] && (
                            <div className="order-3 flex flex-col items-center w-full md:w-1/3 animate-in slide-in-from-bottom-4 duration-700 delay-200">
                                <div className="relative mb-4">
                                    <div className="w-20 h-20 rounded-full border-4 border-orange-700 overflow-hidden">
                                        {top3[2].user.image ? (
                                            <img src={top3[2].user.image} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-800" />
                                        )}
                                    </div>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-700 text-white text-xs font-black px-2 py-0.5 rounded shadow-lg">#3</div>
                                </div>
                                <h3 className="text-white font-bold text-lg text-center">{getDisplayName(top3[2].user)}</h3>
                                <p className="text-gray-400 font-mono text-sm">
                                    {category === 'farm' ? `$${top3[2].value?.toLocaleString()}` : `${top3[2].count} отчетов`}
                                </p>
                                <div className="h-16 w-full bg-linear-to-t from-orange-700/20 to-transparent rounded-t-xl mt-4 mx-8" />
                            </div>
                        )}
                    </div>

                    {/* Rest of the list */}
                    {rest.length > 0 && (
                        <Card className="bg-[#0a0a0a] border-[#1f1f1f]">
                            <div className="divide-y divide-white/5">
                                {rest.map((stat, index) => (
                                    <div key={stat.user.id} className="p-4 flex items-center justify-between hover:bg-white/2 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <span className="text-gray-600 font-black w-6 text-center">{index + 4}</span>
                                            <div className="flex items-center gap-3">
                                                 <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden">
                                                    {stat.user.image && <img src={stat.user.image} className="w-full h-full object-cover" />}
                                                </div>
                                                <span className="text-white font-medium">{getDisplayName(stat.user)}</span>
                                            </div>
                                        </div>
                                        <div className="font-mono text-gray-400">
                                            {category === 'farm' ? `$${stat.value?.toLocaleString()}` : `${stat.count}`}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}
