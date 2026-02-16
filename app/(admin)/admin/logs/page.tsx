'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Activity, Search, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';

type AuditLog = {
  id: string;
  action: string;
  details: string | null;
  createdAt: string;
  actor: {
    name: string | null;
    image: string | null;
    email: string | null;
  };
  target: {
    name: string | null;
    image: string | null;
    email: string | null;
  } | null;
};

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('DELETE')) return 'text-red-500';
    if (action.includes('UPDATE')) return 'text-blue-500';
    if (action.includes('CREATE')) return 'text-green-500';
    return 'text-gray-400';
  };

  const getActionIcon = (action: string) => {
    if (action.includes('DELETE')) return ShieldAlert;
    return Activity;
  };

  const formatActionName = (action: string) => {
    const map: Record<string, string> = {
      'UPDATE_APPLICATION': 'Обновление заявки',
      'DELETE_USER': 'Удаление пользователя',
      'UPDATE_USER': 'Обновление пользователя',
      'CREATE_USER': 'Создание пользователя',
    };
    return map[action] || action;
  };

  const formatActionDetails = (details: string | null) => {
    if (!details) return 'Нет деталей';
    
    // Application status translations
    if (details.includes('Application status: APPROVED')) return 'Заявка одобрена';
    if (details.includes('Application status: REJECTED')) return 'Заявка отклонена';
    if (details.includes('Application status: PENDING')) return 'Заявка на рассмотрении';
    
    // User deletions
    if (details.includes('User deleted by admin')) return 'Пользователь удален администратором';

    // User updates translation
    if (details.startsWith('Updated:')) {
        const fields = details.replace('Updated:', '').trim().split(', ');
        const fieldMap: Record<string, string> = {
            'role': 'Роль',
            'rank': 'Ранг',
            'status': 'Статус',
            'name': 'Имя'
        };
        const translatedFields = fields.map(f => fieldMap[f] || f).join(', ');
        return `Обновлено: ${translatedFields}`;
    }

    return details;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold text-white mb-2">Логи действий</h1>
           <p className="text-gray-400">История изменений и действий администраторов</p>
        </div>
      </div>

      <Card className="bg-[#0a0a0a] border-[#1f1f1f]">
        <CardHeader>
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                 type="text" 
                 placeholder="Поиск по действиям..." 
                 className="w-full bg-[#151515] border border-[#2a2a2a] rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#e81c5a]/50 transition-colors"
              />
           </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
                <div className="text-center py-10 text-gray-500">Загрузка логов...</div>
            ) : logs.length === 0 ? (
                <div className="text-center py-10 text-gray-500">Логов пока нет</div>
            ) : (
                logs.map((log) => {
                  const Icon = getActionIcon(log.action);
                  return (
                    <div key={log.id} className="flex items-start gap-4 p-4 rounded-xl bg-[#151515] border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors">
                       <div className={`p-2 rounded-lg bg-[#2a2a2a] ${getActionColor(log.action)}`}>
                          <Icon className="w-5 h-5" />
                       </div>
                       
                       <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                             <h3 className={`font-bold text-sm ${getActionColor(log.action)}`}>{formatActionName(log.action)}</h3>
                             <span className="text-xs text-gray-500">
                                {format(new Date(log.createdAt), 'dd MMM yyyy HH:mm', { locale: ru })}
                             </span>
                          </div>
                          
                          <p className="text-gray-300 text-sm mb-3">{formatActionDetails(log.details)}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500 bg-[#0a0a0a] rounded-lg p-2 border border-[#2a2a2a]">
                             <div className="flex items-center gap-2">
                                <span className="uppercase text-[10px] font-bold tracking-wider text-gray-600">Кто:</span>
                                <Avatar className="w-5 h-5">
                                   {log.actor.image ? (
                                      <AvatarImage src={log.actor.image} />
                                   ) : (
                                      <AvatarFallback>{log.actor.name?.[0]}</AvatarFallback>
                                   )}
                                </Avatar>
                                <span className="text-white">{log.actor.name}</span>
                             </div>
                             
                             {log.target && (
                                <>
                                  <span className="text-gray-700">➜</span>
                                  <div className="flex items-center gap-2">
                                     <span className="uppercase text-[10px] font-bold tracking-wider text-gray-600">Кому:</span>
                                     <Avatar className="w-5 h-5">
                                        {log.target.image ? (
                                           <AvatarImage src={log.target.image} />
                                        ) : (
                                           <AvatarFallback>{log.target.name?.[0]}</AvatarFallback>
                                        )}
                                     </Avatar>
                                     <span className="text-white">{log.target.name}</span>
                                  </div>
                                </>
                             )}
                          </div>
                       </div>
                    </div>
                  );
                })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
