'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
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
    { id: 10, name: "Leader", color: "text-[#e81c5a]", bg: "bg-[#e81c5a]/10", req: "—", perms: "Full Access" },
    { id: 9, name: "Deputy", color: "text-purple-500", bg: "bg-purple-500/10", req: "Доверие", perms: "Manage, recruiting" },
    { id: 8, name: "Caporegime", color: "text-blue-500", bg: "bg-blue-500/10", req: "Решение лидера", perms: "Lead squads" },
    { id: 7, name: "Soldier", color: "text-green-500", bg: "bg-green-500/10", req: "Аттестация", perms: "Weapons access" },
    { id: 6, name: "Associate", color: "text-yellow-500", bg: "bg-yellow-500/10", req: "Собеседование", perms: "Contracts" },
    { id: 1, name: "Novice", color: "text-gray-500", bg: "bg-gray-500/10", req: "Вступление", perms: "Discord access" },
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
                                {filteredMembers.map((member, i) => {
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Rank List */}
              <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-white mb-4">Иерархия рангов</h2>
                  {RANKS.map((rank) => (
                      <Card key={rank.id} className="group overflow-hidden relative">
                          <div className={cn("absolute left-0 top-0 bottom-0 w-1", rank.color.replace('text-', 'bg-'))} />
                          <CardContent className="p-5 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg", rank.bg, rank.color)}>
                                      {rank.id}
                                  </div>
                                  <div>
                                      <h3 className={cn("font-bold text-lg", rank.color)}>{rank.name}</h3>
                                      <p className="text-sm text-gray-500">Доступ: {rank.perms}</p>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Требование</span>
                                  <span className="font-mono text-white font-bold">{rank.req}</span>
                              </div>
                          </CardContent>
                      </Card>
                  ))}
              </div>

              {/* Responsibilities Info */}
              <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Crown className="w-5 h-5 text-[#e81c5a]" />
                            Система повышения
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-gray-400">
                        <p>
                            Повышение по ранговой системе осуществляется <strong>в ручном режиме</strong> на усмотрение Лидера или старшего состава (Deputy, Caporegime).
                        </p>
                        <p>
                            Для рассмотрения кандидатуры на повышение учитывается:
                        </p>
                        <ul className="space-y-2 list-disc pl-4 text-gray-300">
                            <li>Личная активность и участие в жизни семьи</li>
                            <li>Выполнение поручений старшего состава</li>
                            <li>Отсутствие нарушений и жалоб</li>
                            <li>Доверие со стороны руководства</li>
                        </ul>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="bg-[#0a0a0a] border-dashed border-[#2f2f2f]">
                        <CardContent className="p-6 text-center">
                            <Swords className="w-8 h-8 text-red-500 mx-auto mb-3" />
                            <h4 className="font-bold text-white mb-1">Capture Squad</h4>
                            <p className="text-xs text-gray-500">Ответственные за захват территорий.</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#0a0a0a] border-dashed border-[#2f2f2f]">
                        <CardContent className="p-6 text-center">
                            <Truck className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                            <h4 className="font-bold text-white mb-1">Logistics</h4>
                            <p className="text-xs text-gray-500">Снабжение склада и контракты.</p>
                        </CardContent>
                    </Card>
                </div>
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
