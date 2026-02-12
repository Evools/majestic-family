import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import { ArrowRight, CheckCircle, Clock, Coins, Crown, Flame, Target, TrendingUp, Zap } from 'lucide-react';
import { getServerSession } from 'next-auth';
import Link from 'next/link';

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  
  // Fetch user data to get firstName
  const user = session?.user?.email 
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { firstName: true, name: true, id: true }
      })
    : null;

  // Use firstName if available, otherwise fall back to Discord name
  const displayName = user?.firstName || session?.user?.name || 'Гость';

  // Fetch dashboard settings
  let settings = await prisma.dashboardSettings.findFirst();
  if (!settings) {
    settings = await prisma.dashboardSettings.create({ data: {} });
  }

  // Fetch recent reports for activity feed
  const recentReports = await prisma.report.findMany({
    select: {
      id: true,
      contractType: true,
      status: true,
      createdAt: true,
      user: {
        select: {
          firstName: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 4,
  });

  // Calculate best employee (most approved reports value)
  const bestEmployee = await prisma.user.findFirst({
    where: {
      reports: {
        some: {
          status: 'APPROVED',
        },
      },
    },
    select: {
      firstName: true,
      name: true,
      image: true,
      reports: {
        where: {
          status: 'APPROVED',
        },
        select: {
          userShare: true,
        },
      },
    },
    orderBy: {
      reports: {
        _count: 'desc',
      },
    },
  });

  const bestEmployeeEarnings = bestEmployee?.reports.reduce(
    (sum, report) => sum + (report.userShare || 0),
    0
  ) || 0;

  // Calculate XP percentage
  const xpPercentage = settings.familyXPRequired > 0
    ? Math.round((settings.familyXP / settings.familyXPRequired) * 100)
    : 0;

  // Calculate goal percentage
  const goalPercentage = settings.goalTarget && settings.goalTarget > 0
    ? Math.round(((settings.goalCurrent || 0) / settings.goalTarget) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Добро пожаловать, <span className="text-[#e81c5a]">{displayName}</span></h1>
          <p className="text-gray-400">Сегодня отличный день для ведения бизнеса.</p>
        </div>
        <div className="flex gap-3">
             <Link href="/wiki">
                <Button className="bg-white/5 hover:bg-white/10 text-white border border-white/10">
                    База знаний
                </Button>
             </Link>
             <Link href="/contracts">
                <Button className="bg-[#e81c5a] hover:bg-[#c21548] text-white shadow-[0_0_20px_rgba(232,28,90,0.3)]">
                    Взять контракт
                </Button>
             </Link>
        </div>
      </div>

      {/* Featured Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Event / Bonus */}
          {settings.bonusActive && (
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
                    <h2 className="text-3xl font-bold text-white mb-2">{settings.bonusTitle || 'Специальное предложение'}</h2>
                    <p className="text-white/80 max-w-lg mb-8 text-lg">
                        {settings.bonusDescription || 'Следите за обновлениями!'}
                    </p>
                    <Button className="bg-white text-[#e81c5a] hover:bg-white/90 font-bold border-0">
                        Перейти к контрактам <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </CardContent>
            </Card>
          )}

          {/* Family Bank Status */}
          <Card className={`bg-[#0a0a0a] border border-[#1f1f1f] flex flex-col justify-center ${!settings.bonusActive ? 'lg:col-span-2' : ''}`}>
              <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-6 text-yellow-500">
                      <Coins className="w-8 h-8" />
                  </div>
                  <h3 className="text-gray-400 uppercase tracking-widest text-xs font-bold mb-2">Баланс Семьи</h3>
                  <div className="text-4xl font-mono font-bold text-white mb-4">${settings.familyBalance.toLocaleString()}</div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <Zap className="w-4 h-4" />
                      <span>Обновлено</span>
                  </div>
              </CardContent>
          </Card>
      </div>

        {/* Info Cards */}
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
      
      {/* Activity Feed */}
      <div className="grid grid-cols-1 gap-6">
           <Card className="bg-[#0a0a0a] border border-[#1f1f1f]">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white">Последняя активность</h3>
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-white">
                            Все события
                        </Button>
                    </div>
                    <div className="space-y-6">
                        {recentReports.length > 0 ? (
                          recentReports.map((report) => {
                            const userName = report.user.firstName || report.user.name || 'Unknown';
                            const statusColor = 
                              report.status === 'APPROVED' ? 'text-green-500 bg-green-500/10' :
                              report.status === 'REJECTED' ? 'text-red-500 bg-red-500/10' :
                              'text-yellow-500 bg-yellow-500/10';
                            const statusIcon = 
                              report.status === 'APPROVED' ? CheckCircle :
                              report.status === 'REJECTED' ? Target :
                              Clock;
                            const StatusIcon = statusIcon;
                            
                            return (
                              <div key={report.id} className="flex items-start gap-4">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${statusColor}`}>
                                      <StatusIcon className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1">
                                      <p className="text-sm text-gray-300">
                                          <span className="font-bold text-white hover:text-[#e81c5a] cursor-pointer transition-colors">{userName}</span> отправил отчет <span className="font-medium text-white">{report.contractType}</span>
                                      </p>
                                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                          <Clock className="w-3 h-3" />
                                          {new Date(report.createdAt).toLocaleDateString('ru-RU')}
                                      </p>
                                  </div>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-center text-gray-500 py-8">Нет активности</p>
                        )}
                    </div>
                </CardContent>
           </Card>
      </div>
    </div>
  );
}
