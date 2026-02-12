'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
    Briefcase,
    Crown,
    Search,
    Shield,
    Swords,
    Truck,
    UserPlus,
    Users
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Member {
    id: string;
    name: string | null;
    staticId: string | null;
    rank: number;
    roleName: string;
    lastActiveAt: string | null;
    image: string | null;
}

interface Rank {
    id: number;
    name: string;
    color: string;
    bg: string;
    req: string;
    perms: string;
}

const RANKS: Rank[] = [
    { id: 10, name: "Глава семьи", color: "text-red-500", bg: "bg-red-500/10", req: "—", perms: "Главный руководитель. Полный контроль." },
    { id: 9, name: "Заместитель главы", color: "text-yellow-500", bg: "bg-yellow-500/10", req: "Доверие", perms: "Правая рука главы. Координация." },
    { id: 8, name: "Старшее руководство", color: "text-cyan-500", bg: "bg-cyan-500/10", req: "Назначение", perms: "Контроль дисциплины. Доступ к сейфу." },
    { id: 7, name: "Руководитель направлений", color: "text-cyan-500", bg: "bg-cyan-500/10", req: "Назначение", perms: "Контракты, фарм, актив и экономика." },
    { id: 6, name: "Старший состава", color: "text-green-500", bg: "bg-green-500/10", req: "Активность", perms: "Наставник. Помощь руководству." },
    { id: 5, name: "Основной состав", color: "text-green-500", bg: "bg-green-500/10", req: "Контракты и Актив", perms: "Фундамент семьи. Регулярные контракты." },
    { id: 4, name: "Младший состав", color: "text-green-500", bg: "bg-green-500/10", req: "Контракты", perms: "Начальный рабочий уровень. Помощь." },
    { id: 3, name: "Рекрутер", color: "text-orange-500", bg: "bg-orange-500/10", req: "Фамилия Shelby", perms: "Поиск и приглашение новых людей." },
    { id: 2, name: "Стажёр", color: "text-blue-500", bg: "bg-blue-500/10", req: "Знание правил", perms: "Испытательный срок. Базовые задачи." },
    { id: 1, name: "Кандидат", color: "text-emerald-500", bg: "bg-emerald-500/10", req: "Вступление", perms: "Минимальные права. Проверка." },
];

export default function MembersPage() {
    const [activeTab, setActiveTab] = useState<'roster' | 'ranks'>('roster');
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await fetch('/api/members');
                const data = await res.json();
                setMembers(data);
            } catch (error) {
                console.error('Error fetching members:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMembers();
    }, []);

    const filteredMembers = members.filter((m: Member) => 
        (m.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
         m.roleName?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Состав Семьи</h1>
          <p className="text-gray-400 mt-1">Управление участниками и рангами.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setActiveTab('ranks')} className={cn("transition-all", activeTab === 'ranks' && "bg-white/10 text-white")}>
                <Shield className="w-4 h-4 mr-2" />
                Система рангов
            </Button>
            <Button variant="outline" size="sm" onClick={() => setActiveTab('roster')} className={cn("transition-all", activeTab === 'roster' && "bg-white/10 text-white")}>
                <Users className="w-4 h-4 mr-2" />
                Список участников
            </Button>
            <Button size="sm" className="bg-[#e81c5a] hover:bg-[#c21548]">
                <UserPlus className="w-4 h-4 mr-2" />
                Пригласить
            </Button>
        </div>
      </div>

      {activeTab === 'roster' ? (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-[#0a0a0a] border-[#1f1f1f]">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Всего участников</p>
                            <h3 className="text-2xl font-bold text-white mt-1">{members.length}</h3>
                        </div>
                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
                            <Users className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-[#0a0a0a] border-[#1f1f1f]">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Активные (24ч)</p>
                            <h3 className="text-2xl font-bold text-white mt-1">
                                {members.filter(m => m.lastActiveAt && new Date(m.lastActiveAt).getTime() > Date.now() - 24 * 60 * 60 * 1000).length}
                            </h3>
                        </div>
                        <div className="p-3 bg-green-500/10 text-green-500 rounded-lg">
                            <ActivityIcon />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Members Table */}
            <Card className="overflow-hidden bg-[#0a0a0a] border-[#1f1f1f]">
                <div className="p-4 border-b border-white/5 flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input 
                            placeholder="Поиск участника..." 
                            className="pl-9 bg-[#050505] border-[#1f1f1f] h-9 text-xs" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-20 text-center">
                            <div className="inline-block w-8 h-8 border-2 border-[#e81c5a]/20 border-t-[#e81c5a] rounded-full animate-spin" />
                            <p className="text-gray-500 text-xs mt-4 uppercase tracking-widest">Загрузка состава...</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="text-[10px] text-gray-400 uppercase border-b border-white/10 bg-white/5">
                                <tr>
                                    <th className="px-6 py-4 font-bold tracking-widest">Участник</th>
                                    <th className="px-6 py-4 font-bold tracking-widest text-center">Ранг</th>
                                    <th className="px-6 py-4 font-bold tracking-widest">Роль</th>
                                    <th className="px-6 py-4 font-bold tracking-widest text-right">Статус</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredMembers.map((member) => {
                                    const rankInfo = RANKS.find(r => r.id === member.rank) || RANKS[RANKS.length - 1];
                                    const isActive = member.lastActiveAt && new Date(member.lastActiveAt).getTime() > Date.now() - 5 * 60 * 1000;
                                    
                                    return (
                                        <tr key={member.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded bg-linear-to-br from-gray-700 to-gray-900 border border-white/10 overflow-hidden shrink-0">
                                                        {member.image && <img src={member.image} className="w-full h-full object-cover" />}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-white tracking-tight">{member.name || 'Неизвестно'}</span>
                                                        <span className="text-[9px] text-gray-600 font-mono">ID: {member.staticId || '—'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={cn("inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider min-w-[80px]", rankInfo.bg, rankInfo.color)}>
                                                    {rankInfo.name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 text-xs">{member.roleName}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className={cn("text-[10px] uppercase font-bold tracking-widest", isActive ? "text-green-500" : "text-gray-600")}>
                                                        {isActive ? "Online" : "Offline"}
                                                    </span>
                                                    <div className={cn("w-1.5 h-1.5 rounded-full", isActive ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-gray-800")} />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredMembers.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-20 text-center text-gray-500 text-xs uppercase tracking-widest">
                                            Участники не найдены
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </Card>
          </>
      ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Rank List Section */}
              <div className="lg:col-span-3 space-y-8">
                  <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-white tracking-tight">Иерархия рангов</h2>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">10 Уровней</span>
                  </div>

                  <div className="space-y-6">
                      {[
                          { title: "Руководство", ranks: RANKS.filter(r => r.id >= 9), color: "text-[#e81c5a]" },
                          { title: "Управление", ranks: RANKS.filter(r => r.id >= 7 && r.id < 9), color: "text-cyan-500" },
                          { title: "Основной", ranks: RANKS.filter(r => r.id >= 4 && r.id < 7), color: "text-green-500" },
                          { title: "Начинающий", ranks: RANKS.filter(r => r.id < 4), color: "text-blue-500" },
                      ].map((tier, tidx) => (
                          <div key={tidx} className="space-y-3">
                              <div className="flex items-center gap-3 px-1">
                                  <div className={cn("w-1 h-3 rounded-full", tier.color.replace('text-', 'bg-'))} />
                                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{tier.title}</h3>
                              </div>
                              <Card className="bg-[#0a0a0a] border-[#1f1f1f] overflow-hidden">
                                  <div className="divide-y divide-white/5">
                                      {tier.ranks.map((rank) => (
                                          <div key={rank.id} className="group p-4 flex items-center justify-between hover:bg-white/2 transition-colors relative">
                                              <div className="flex items-center gap-4">
                                                  <div className={cn("w-10 h-10 rounded border border-white/5 flex items-center justify-center font-bold text-lg shrink-0", rank.bg, rank.color)}>
                                                      {rank.id}
                                                  </div>
                                                  <div>
                                                      <h4 className={cn("font-bold text-sm tracking-tight", rank.color)}>{rank.name}</h4>
                                                      <p className="text-[11px] text-gray-500 line-clamp-1">{rank.perms}</p>
                                                  </div>
                                              </div>
                                              <div className="text-right shrink-0">
                                                  <span className="text-[8px] text-gray-600 uppercase tracking-widest block mb-0.5">Требование</span>
                                                  <span className="text-[10px] text-gray-400 font-bold uppercase">{rank.req}</span>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              </Card>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Info Column */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-[#0a0a0a] border-[#1f1f1f] sticky top-8">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-white">
                            <Crown className="w-5 h-5 text-[#e81c5a]" />
                            Система повышения
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex flex-col gap-3">
                                {[
                                    { icon: Swords, text: "Высокая активность", desc: "Участие в жизни семьи." },
                                    { icon: Briefcase, text: "Значимый вклад", desc: "Контракты и ресурсы." },
                                    { icon: Shield, text: "Соблюдение устава", desc: "Дисциплина и поведение." }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-4 p-3 rounded-lg bg-white/2 border border-white/5 hover:border-[#e81c5a]/20 transition-all duration-300">
                                        <div className="w-8 h-8 rounded-md bg-[#e81c5a]/10 flex items-center justify-center shrink-0">
                                            <item.icon className="w-4 h-4 text-[#e81c5a]" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white tracking-tight">{item.text}</p>
                                            <p className="text-[10px] text-gray-500 mt-0.5">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 rounded-lg bg-orange-500/3 border border-orange-500/10 space-y-3">
                            <div className="flex items-center gap-2">
                                <Shield className="w-3 h-3 text-orange-500" />
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-orange-500">Важные правила</h4>
                            </div>
                            <ul className="space-y-2.5">
                                {[
                                    "Ранги не покупаются и не выпрашиваются.",
                                    "Выпрашивание может привести к выговору.",
                                    "Повышение только после подтверждения Hight рангов.",
                                    "Переход на 6+ ранг — только с подтверждением 8+ ранга."
                                ].map((rule, idx) => (
                                    <li key={idx} className="text-[11px] text-gray-500 leading-relaxed flex gap-2">
                                        <span className="text-orange-500/50 shrink-0">•</span>
                                        {rule}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="p-4 bg-[#0a0a0a] border border-white/5 rounded-lg text-center group hover:border-[#e81c5a]/20 transition-all">
                                <Swords className="w-5 h-5 text-[#e81c5a] mx-auto mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-white">War</h4>
                            </div>
                            <div className="p-4 bg-[#0a0a0a] border border-white/5 rounded-lg text-center group hover:border-blue-500/20 transition-all">
                                <Truck className="w-5 h-5 text-blue-500 mx-auto mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Farm</h4>
                            </div>
                        </div>
                    </CardContent>
                </Card>
              </div>
          </div>
      )}
    </div>
  );
}

function ActivityIcon() {
    return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}
