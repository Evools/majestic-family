import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, CheckCircle, Clock, Coins, Crown, Flame, Target, TrendingUp, Users, Zap } from 'lucide-react';
import { getServerSession } from 'next-auth';

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Добро пожаловать, <span className="text-[#e81c5a]">{session?.user?.name}</span></h1>
          <p className="text-gray-400">Сегодня отличный день для ведения бизнеса.</p>
        </div>
        <div className="flex gap-3">
             <Button className="bg-white/5 hover:bg-white/10 text-white border border-white/10">
                База знаний
             </Button>
             <Button className="bg-[#e81c5a] hover:bg-[#c21548] text-white shadow-[0_0_20px_rgba(232,28,90,0.3)]">
                Взять контракт
             </Button>
        </div>
      </div>

      {/* Featured Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Event / Bonus */}
          <Card className="lg:col-span-2 relative overflow-hidden border-0 bg-linear-to-r from-[#e81c5a] to-[#7f1d1d]">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Flame className="w-64 h-64 text-white transform rotate-12" />
              </div>
              <CardContent className="p-8 relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/10">
                          Активный бонус
                      </span>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">X2 Опыт на все выхолные.</h2>
                  <p className="text-white/80 max-w-lg mb-8 text-lg">
                      Все контракты приносят удвоенное количество опыта и репутации до конца выходных.
                  </p>
                  <Button className="bg-white text-[#e81c5a] hover:bg-white/90 font-bold border-0">
                      Перейти к контрактам <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
              </CardContent>
          </Card>

          {/* Family Bank Status */}
          <Card className="bg-[#0a0a0a] border border-[#1f1f1f] flex flex-col justify-center">
              <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-6 text-yellow-500">
                      <Coins className="w-8 h-8" />
                  </div>
                  <h3 className="text-gray-400 uppercase tracking-widest text-xs font-bold mb-2">Баланс Семьи</h3>
                  <div className="text-4xl font-mono font-bold text-white mb-4">$4,250,590</div>
                  <div className="flex items-center justify-center gap-2 text-sm text-green-500">
                      <Zap className="w-4 h-4 fill-current" />
                      <span>+12% за неделю</span>
                  </div>
              </CardContent>
          </Card>
      </div>

        {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-[#0a0a0a] border border-[#1f1f1f] hover:border-[#e81c5a]/50 transition-colors group cursor-pointer">
              <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="text-gray-400 font-medium">Финансовая цель</h3>
                      <Target className="w-5 h-5 text-[#e81c5a]" />
                  </div>
                  <div className="mb-4">
                      <p className="text-xl font-bold text-white mb-1 group-hover:text-[#e81c5a] transition-colors">Покупка Особняка</p>
                      <p className="text-sm text-gray-500">Собрано $4.2M из $10M</p>
                  </div>
                  <div className="h-1.5 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div className="h-full bg-[#e81c5a] w-[42%]" />
                  </div>
              </CardContent>
          </Card>

           <Card className="bg-[#0a0a0a] border border-[#1f1f1f] hover:border-[#e81c5a]/50 transition-colors group cursor-pointer">
              <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="text-gray-400 font-medium">Лучший сотрудник</h3>
                      <Crown className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-gray-700 to-gray-900 border border-white/10" />
                      <div>
                          <p className="font-bold text-white">John Wick</p>
                          <p className="text-xs text-yellow-500 font-mono">$150,000 / week</p>
                      </div>
                  </div>
              </CardContent>
          </Card>

          <Card className="bg-[#0a0a0a] border border-[#1f1f1f] hover:border-[#e81c5a]/50 transition-colors group cursor-pointer">
              <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="text-gray-400 font-medium">Уровень семьи</h3>
                      <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="space-y-2">
                       <div className="flex justify-between text-sm">
                           <span className="text-white font-bold text-xl">5 Lvl</span>
                           <span className="text-gray-400 font-mono">85%</span>
                       </div>
                       <div className="h-1.5 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
                           <div className="h-full bg-green-500 w-[85%]" />
                       </div>
                       <p className="text-xs text-gray-500 mt-1">До следующего уровня 1,500 XP</p>
                  </div>
              </CardContent>
          </Card>
      </div>
      
      {/* Activity and Garage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Feed */}
           <Card className="lg:col-span-2 bg-[#0a0a0a] border border-[#1f1f1f]">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white">Последняя активность</h3>
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-white">
                            Все события
                        </Button>
                    </div>
                    <div className="space-y-6">
                        {[
                            { user: "Reid Shelby", action: "положил на счет", target: "$50,000", time: "10 мин. назад", icon: Coins, color: "text-yellow-500", bg: "bg-yellow-500/10" },
                            { user: "John Wick", action: "взял со склада", target: "CarBine Rifle Mk2 (x2)", time: "25 мин. назад", icon: Target, color: "text-[#e81c5a]", bg: "bg-[#e81c5a]/10" },
                            { user: "Sarah Connor", action: "повышена до ранга", target: "Soldier", time: "1 час назад", icon: Crown, color: "text-blue-500", bg: "bg-blue-500/10" },
                            { user: "Arthur Shelby", action: "завершил контракт", target: "Дальнобойщик", time: "2 часа назад", icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.bg}`}>
                                    <item.icon className={`w-4 h-4 ${item.color}`} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-300">
                                        <span className="font-bold text-white hover:text-[#e81c5a] cursor-pointer transition-colors">{item.user}</span> {item.action} <span className="font-medium text-white">{item.target}</span>
                                    </p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                        <Clock className="w-3 h-3" />
                                        {item.time}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
           </Card>


           {/* Management Online */}
           <Card className="bg-[#0a0a0a] border border-[#1f1f1f]">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white">Руководство</h3>
                        <Users className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="space-y-4">
                        {[
                            { name: "Reid Shelby", rank: "Leader", status: "online" },
                            { name: "Arthur Shelby", rank: "Deputy", status: "online" },
                            { name: "Polly Gray", rank: "Treasurer", status: "offline", lastSeen: "15м назад" },
                            { name: "John Wick", rank: "Caporegime", status: "online" },
                        ].map((member, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-white/10">
                                            <span className="font-bold text-xs text-white">{member.name[0]}</span>
                                        </div>
                                        {member.status === 'online' && (
                                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-[#0a0a0a] rounded-full" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{member.name}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">{member.rank}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {member.status === 'online' ? (
                                        <span className="text-xs text-green-500 font-medium">В сети</span>
                                    ) : (
                                        <span className="text-xs text-gray-600">{member.lastSeen}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button className="w-full mt-6 bg-white/5 hover:bg-white/10 text-white border border-white/10">
                        Весь состав
                    </Button>
                </CardContent>
           </Card>
      </div>
    </div>
  );
}
