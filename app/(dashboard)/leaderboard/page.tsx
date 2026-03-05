'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Calendar, Crown, Flame, Medal, Star, TrendingUp, Trophy } from 'lucide-react';
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
            {/* Header Area */}
            <div className="relative overflow-hidden rounded-2xl bg-[#0a0a0a] border border-[#1f1f1f] p-8">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-white/5 to-transparent pointer-events-none" />
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-yellow-500/20 to-amber-600/20 border border-yellow-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                            <Trophy className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight">Зал Славы</h1>
                            <p className="text-gray-400 mt-1 text-sm font-medium">Элита семьи Shelby. Соревнуйтесь и побеждайте.</p>
                        </div>
                    </div>
                    
                    {/* Period Toggle */}
                    <div className="flex bg-[#0a0a0a] p-1.5 rounded-xl border border-[#1f1f1f] shadow-inner">
                        <button
                            onClick={() => setPeriod('all')}
                            className={cn(
                                "px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300",
                                period === 'all' 
                                    ? "bg-white text-black shadow-md border-transparent" 
                                    : "text-gray-500 hover:text-white border border-transparent"
                            )}
                        >
                            За все время
                        </button>
                        <button
                            onClick={() => setPeriod('month')}
                            className={cn(
                                "flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300",
                                period === 'month' 
                                    ? "bg-white text-black shadow-md border-transparent" 
                                    : "text-gray-500 hover:text-white border border-transparent"
                            )}
                        >
                            <Calendar className="w-3.5 h-3.5" />
                            Этот месяц
                        </button>
                    </div>
                </div>
            </div>

            {/* Category Switcher Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Card 
                    className={cn(
                        "cursor-pointer transition-all duration-300 group relative overflow-hidden",
                        category === 'farm' 
                            ? "bg-linear-to-br from-[#e81c5a] to-[#7f1d1d] border-transparent shadow-[0_0_20px_rgba(232,28,90,0.2)]" 
                            : "bg-[#0a0a0a] border-[#1f1f1f] hover:border-white/20"
                    )}
                    onClick={() => setCategory('farm')}
                 >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <TrendingUp className="w-32 h-32 text-white transform rotate-12 transition-transform duration-700 group-hover:scale-110" />
                    </div>
                    <CardContent className="p-6 relative z-10 flex flex-col h-full justify-between gap-4">
                        <div className="flex items-center gap-4">
                             <div className={cn(
                                 "p-3 rounded-xl border backdrop-blur-sm transition-colors duration-300", 
                                 category === 'farm' ? "bg-white/20 border-white/20 text-white" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 group-hover:bg-emerald-500/20"
                             )}>
                                <TrendingUp className="w-7 h-7" />
                             </div>
                             <div>
                                 <h3 className={cn("text-xl font-black tracking-tight", category === 'farm' ? "text-white" : "text-gray-300 group-hover:text-white")}>Крупные игроки</h3>
                                 <p className={cn("text-[10px] font-bold uppercase tracking-widest mt-1", category === 'farm' ? "text-white/80" : "text-gray-500")}>
                                     Топ по заработанным деньгам
                                 </p>
                             </div>
                        </div>
                    </CardContent>
                 </Card>

                 <Card 
                    className={cn(
                        "cursor-pointer transition-all duration-300 group relative overflow-hidden",
                        category === 'activity' 
                            ? "bg-linear-to-br from-[#e81c5a] to-[#7f1d1d] border-transparent shadow-[0_0_20px_rgba(232,28,90,0.2)]" 
                            : "bg-[#0a0a0a] border-[#1f1f1f] hover:border-white/20"
                    )}
                    onClick={() => setCategory('activity')}
                 >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Flame className="w-32 h-32 text-white transform rotate-12 transition-transform duration-700 group-hover:scale-110" />
                    </div>
                    <CardContent className="p-6 relative z-10 flex flex-col h-full justify-between gap-4">
                        <div className="flex items-center gap-4">
                             <div className={cn(
                                 "p-3 rounded-xl border backdrop-blur-sm transition-colors duration-300", 
                                 category === 'activity' ? "bg-white/20 border-white/20 text-white" : "bg-amber-500/10 border-amber-500/20 text-amber-500 group-hover:bg-amber-500/20"
                             )}>
                                <Flame className="w-7 h-7" />
                             </div>
                             <div>
                                <h3 className={cn("text-xl font-black tracking-tight", category === 'activity' ? "text-white" : "text-gray-300 group-hover:text-white")}>Топ Активистов</h3>
                                <p className={cn("text-[10px] font-bold uppercase tracking-widest mt-1", category === 'activity' ? "text-white/80" : "text-gray-500")}>
                                    Топ по количеству отчетов
                                </p>
                             </div>
                        </div>
                    </CardContent>
                 </Card>
            </div>

            {loading ? (
                <div className="py-32 flex flex-col items-center justify-center bg-[#0a0a0a]/50 rounded-2xl border border-[#1f1f1f] border-dashed">
                    <div className="w-10 h-10 border-2 border-[#e81c5a]/20 border-t-[#e81c5a] rounded-full animate-spin mb-4" />
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest animate-pulse">Составление рейтинга...</p>
                </div>
            ) : currentList.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center text-center bg-[#0a0a0a]/50 rounded-2xl border border-[#1f1f1f] border-dashed">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <Trophy className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Зал славы пуст</h3>
                    <p className="text-sm text-gray-500 max-w-sm">
                        В этом периоде еще нет статистики. Будьте первым, кто проявит себя!
                    </p>
                </div>
            ) : (
                <div className="space-y-12">
                    {/* Modern Podium for Top 3 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0 items-end min-h-[350px] px-4 pd-8">
                        
                        {/* 2nd Place */}
                        <div className="order-2 md:order-1 flex flex-col items-center w-full animate-in slide-in-from-bottom-8 duration-700 delay-100 relative">
                            {top3[1] ? (
                                <>
                                    <div className="relative mb-6 group">
                                        <div className="w-24 h-24 rounded-2xl border-2 border-gray-400/50 overflow-hidden shadow-lg transition-transform duration-500 group-hover:scale-110 bg-gray-900 border-b-4">
                                            {top3[1].user.image ? (
                                                <img src={top3[1].user.image} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-linear-to-br from-gray-800 to-gray-900 flex items-center justify-center text-gray-500">
                                                    <Star className="w-8 h-8 opacity-50" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gray-400 text-black text-xs font-black px-3 py-1 rounded-full shadow-[0_4px_10px_rgba(156,163,175,0.4)] flex items-center gap-1 border-2 border-[#0a0a0a]">
                                            <Medal className="w-3 h-3" /> 2
                                        </div>
                                    </div>
                                    <h3 className="text-white font-bold text-lg text-center mb-1">{getDisplayName(top3[1].user)}</h3>
                                    <p className="text-gray-400 font-mono font-bold text-sm bg-white/5 px-3 py-1 rounded-lg">
                                        {category === 'farm' ? `$${top3[1].value?.toLocaleString()}` : `${top3[1].count} отчетов`}
                                    </p>
                                    <div className="h-32 w-full md:w-4/5 mx-auto bg-linear-to-t from-gray-400/20 via-gray-400/5 to-transparent border-t-2 border-gray-300 rounded-t-2xl mt-6 relative overflow-hidden flex items-end justify-center pb-2 shadow-[0_-10px_30px_rgba(156,163,175,0.1)]">
                                        <div className="absolute inset-0 bg-gray-400/5 backdrop-blur-xs" />
                                        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-gray-300 to-transparent opacity-80" />
                                        <span className="text-gray-400/20 font-black text-7xl relative z-10 leading-none">2</span>
                                    </div>
                                </>
                            ) : (
                                <div className="h-64 w-full md:w-4/5 mx-auto border border-dashed border-white/5 rounded-t-2xl flex items-end justify-center pb-8 opacity-30">
                                    <span className="text-gray-700 font-black text-2xl">2</span>
                                </div>
                            )}
                        </div>

                        {/* 1st Place */}
                        <div className="order-1 md:order-2 flex flex-col items-center w-full z-10 animate-in slide-in-from-bottom-12 duration-700 relative">
                            {top3[0] ? (
                                <>
                                    <Crown className="w-10 h-10 text-yellow-400 mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] animate-bounce" />
                                    <div className="relative mb-6 group">
                                        <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full" />
                                        <div className="w-32 h-32 rounded-3xl border-2 border-yellow-500/50 overflow-hidden shadow-[0_0_30px_rgba(234,179,8,0.2)] transition-transform duration-500 group-hover:scale-110 relative bg-gray-900 border-b-4">
                                            {top3[0].user.image ? (
                                                <img src={top3[0].user.image} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-linear-to-br from-gray-800 to-gray-900 flex items-center justify-center text-yellow-500/30">
                                                    <Crown className="w-12 h-12" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-sm font-black px-4 py-1 rounded-full shadow-[0_4px_15px_rgba(250,204,21,0.5)] flex items-center gap-1 border-2 border-[#0a0a0a]">
                                            <Trophy className="w-3.5 h-3.5" /> 1
                                        </div>
                                    </div>
                                    <h3 className="text-white font-black text-2xl text-center mb-1 drop-shadow-lg">{getDisplayName(top3[0].user)}</h3>
                                    <p className="text-yellow-400 font-mono font-black text-lg bg-yellow-500/10 border border-yellow-500/20 px-4 py-1.5 rounded-xl">
                                        {category === 'farm' ? `$${top3[0].value?.toLocaleString()}` : `${top3[0].count} отчетов`}
                                    </p>
                                    <div className="h-44 w-full md:w-11/12 mx-auto bg-linear-to-t from-yellow-500/20 via-yellow-500/5 to-transparent border-t-2 border-yellow-400 rounded-t-3xl mt-6 relative overflow-hidden flex items-end justify-center pb-4 shadow-[0_-10px_40px_rgba(250,204,21,0.15)]">
                                        <div className="absolute inset-0 bg-yellow-400/5 backdrop-blur-sm" />
                                        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-yellow-300 to-transparent opacity-80" />
                                        <span className="text-yellow-500/20 font-black text-8xl relative z-10 leading-none mt-4">1</span>
                                    </div>
                                </>
                            ) : (
                                <div className="h-72 w-full md:w-11/12 mx-auto border border-dashed border-white/5 rounded-t-3xl flex items-end justify-center pb-8 opacity-30 mt-14">
                                    <span className="text-gray-700 font-black text-4xl">1</span>
                                </div>
                            )}
                        </div>

                        {/* 3rd Place */}
                        <div className="order-3 flex flex-col items-center w-full animate-in slide-in-from-bottom-4 duration-700 delay-200 relative">
                            {top3[2] ? (
                                <>
                                    <div className="relative mb-6 group mt-8 md:mt-0">
                                        <div className="w-20 h-20 rounded-2xl border-2 border-amber-700/50 overflow-hidden shadow-lg transition-transform duration-500 group-hover:scale-110 bg-gray-900 border-b-4">
                                            {top3[2].user.image ? (
                                                <img src={top3[2].user.image} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-linear-to-br from-gray-800 to-gray-900 flex items-center justify-center text-amber-700/50">
                                                    <Star className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-700 text-white text-xs font-black px-3 py-1 rounded-full shadow-[0_4px_10px_rgba(180,83,9,0.4)] flex items-center gap-1 border-2 border-[#0a0a0a]">
                                            <Medal className="w-3 h-3" /> 3
                                        </div>
                                    </div>
                                    <h3 className="text-white font-bold text-lg text-center mb-1">{getDisplayName(top3[2].user)}</h3>
                                    <p className="text-gray-400 font-mono font-bold text-sm bg-white/5 px-3 py-1 rounded-lg">
                                        {category === 'farm' ? `$${top3[2].value?.toLocaleString()}` : `${top3[2].count} отчетов`}
                                    </p>
                                    <div className="h-24 w-full md:w-4/5 mx-auto bg-linear-to-t from-amber-700/30 via-amber-700/5 to-transparent border-t-2 border-amber-600 rounded-t-2xl mt-6 relative overflow-hidden flex items-end justify-center pb-2 shadow-[0_-10px_30px_rgba(180,83,9,0.1)]">
                                        <div className="absolute inset-0 bg-amber-700/5 backdrop-blur-xs" />
                                        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-amber-600 to-transparent opacity-80" />
                                        <span className="text-amber-700/30 font-black text-6xl relative z-10 leading-none">3</span>
                                    </div>
                                </>
                            ) : (
                                <div className="h-52 w-full md:w-4/5 mx-auto border border-dashed border-white/5 rounded-t-2xl flex items-end justify-center pb-8 opacity-30 mt-20">
                                    <span className="text-gray-700 font-black text-2xl">3</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Rest of the list */}
                    {rest.length > 0 && (
                        <Card className="bg-[#0a0a0a] border border-[#1f1f1f] overflow-hidden">
                            <div className="divide-y divide-white/5">
                                {rest.map((stat, index) => (
                                    <div key={stat.user.id} className="p-4 md:px-6 flex items-center justify-between hover:bg-white-[0.02] transition-colors group">
                                        <div className="flex items-center gap-4 md:gap-6">
                                            <span className="text-gray-600 font-black text-sm md:text-base w-6 text-center group-hover:text-gray-400 transition-colors">
                                                {index + 4}
                                            </span>
                                            <div className="flex items-center gap-3 md:gap-4">
                                                 <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gray-900 border border-white/5 overflow-hidden shadow-inner">
                                                    {stat.user.image ? (
                                                        <img src={stat.user.image} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-700 font-bold">
                                                            {(stat.user.firstName?.[0] || stat.user.name?.[0] || '?').toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-gray-300 font-bold group-hover:text-white transition-colors">{getDisplayName(stat.user)}</span>
                                            </div>
                                        </div>
                                        <div className="font-mono font-medium text-gray-400 bg-white/5 px-3 py-1 rounded-md text-sm md:text-base">
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
