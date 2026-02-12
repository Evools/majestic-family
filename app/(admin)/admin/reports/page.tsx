'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Report } from '@prisma/client';
import { Check, ExternalLink, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';

// Extend Report type to include relations
type ReportWithRelations = Report & {
  user: { name: string | null; image: string | null; firstName: string | null; lastName: string | null };
  userContract: {
    contract: {
      id: string;
      title: string;
      reward: number;
      reputation: number;
    };
  } | null;
  participants: Array<{
    id: string;
    user: {
      id: string;
      name: string | null;
      firstName: string | null;
      lastName: string | null;
      image: string | null;
    };
  }>;
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Action State
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [activeAction, setActiveAction] = useState<{ id: string; type: 'approve' | 'reject' } | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/admin/reports');
      if (res.ok) {
        setReports(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch reports', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!activeAction) return;
    
    const report = reports.find(r => r.id === activeAction.id);
    if (!report) return;

    // For approval, use contract reward
    const contractReward = report.userContract?.contract?.reward || 0;
    
    setProcessingId(activeAction.id);
    try {
      const body = {
        reportId: activeAction.id,
        action: activeAction.type,
        ...(activeAction.type === 'approve' ? { value: contractReward.toString() } : { rejectionReason })
      };

      const res = await fetch('/api/admin/reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        // Remove from list or update status
        setReports(prev => prev.filter(r => r.id !== activeAction.id));
        setActiveAction(null);
        setRejectionReason('');
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to process report');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  const getUserDisplayName = (user: { firstName: string | null; lastName: string | null; name: string | null }) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.name || 'Unknown User';
  };

  // Calculate Stats
  const stats = {
    pending: reports.length,
    totalValue: reports.reduce((acc, r) => acc + (r.userContract?.contract?.reward || 0), 0),
    totalParticipants: reports.reduce((acc, r) => acc + r.participants.length, 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#e81c5a] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Отчеты</h1>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Проверка и распределение вознаграждений</p>
        </div>

        <div className="flex items-center gap-4">
            <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1 min-w-[140px]">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ожидают</span>
                <span className="text-xl font-black text-white">{stats.pending}</span>
            </div>
            <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1 min-w-[140px]">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Сумма фонда</span>
                <span className="text-xl font-black text-green-500">${stats.totalValue.toLocaleString()}</span>
            </div>
            <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1 min-w-[140px]">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Участников</span>
                <span className="text-xl font-black text-blue-500">{stats.totalParticipants}</span>
            </div>
        </div>
      </div>
      
      {reports.length === 0 ? (
        <Card className="bg-[#0a0a0a] border-[#1f1f1f] border-dashed">
            <CardContent className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-6 h-6 text-gray-600" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Все отчеты проверены</h3>
                <p className="text-sm text-gray-500">На данный момент нет новых отчетов для модерации.</p>
            </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const participantCount = report.participants.length;
            const contractReward = report.userContract?.contract?.reward || 0;
            const familyShare = contractReward * 0.4;
            const userShare = contractReward * 0.6;
            const individualShare = participantCount > 0 ? userShare / participantCount : 0;
            const isProcessing = processingId === report.id;
            const isActive = activeAction?.id === report.id;

            return (
              <div 
                key={report.id} 
                className={`group relative bg-[#0a0a0a] border ${isActive ? 'border-[#e81c5a]/40 shadow-[0_0_20px_rgba(232,28,90,0.1)]' : 'border-[#1f1f1f] hover:border-white/10'} rounded-xl transition-all duration-300 overflow-hidden`}
              >
                {/* Horizontal Layout */}
                <div className="p-4 flex flex-col lg:flex-row lg:items-center gap-6">
                  
                  {/* 1. Author Column */}
                  <div className="flex items-center gap-4 lg:w-[250px] shrink-0">
                    <div className="relative">
                        {report.user.image ? (
                            <img src={report.user.image} alt="" className="w-10 h-10 rounded-full object-cover border border-white/10" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                <Users className="w-5 h-5 text-gray-600" />
                            </div>
                        )}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-[#0a0a0a]" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-white truncate max-w-[160px]">{getUserDisplayName(report.user)}</p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                            {new Date(report.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                  </div>

                  {/* 2. Contract Info Column */}
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4 border-l border-white/5 pl-6">
                    <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-black text-white bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded uppercase tracking-widest">
                                {report.userContract?.contract?.title || 'Contract'}
                            </span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                {report.itemName} x{report.quantity}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <a 
                                href={report.proof} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-[10px] font-bold text-[#e81c5a] hover:text-[#ff2d6d] uppercase tracking-widest transition-colors group/link"
                            >
                                <ExternalLink className="w-3.5 h-3.5 group-hover/link:scale-110 transition-transform" />
                                Доказательства
                            </a>
                            {report.comment && (
                                <span className="text-[10px] font-medium text-gray-500 italic truncate max-w-[200px]">
                                    "{report.comment}"
                                </span>
                            )}
                        </div>
                    </div>

                    {/* 3. Reward Distribution Summary */}
                    <div className="flex items-center gap-4 bg-white/2 px-3 py-2 rounded-lg border border-white/5 shrink-0">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none">Семья 40%</span>
                            <span className="text-xs font-black text-yellow-500/80">${familyShare.toLocaleString()}</span>
                        </div>
                        <div className="w-px h-6 bg-white/5" />
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none">Участникам 60%</span>
                            <span className="text-xs font-black text-green-500/80">${userShare.toLocaleString()}</span>
                        </div>
                        <div className="w-px h-6 bg-white/5" />
                        <div className="flex flex-col gap-0.5 min-w-[60px]">
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none flex items-center gap-1">
                                <Users className="w-2.5 h-2.5" /> {participantCount + 1} чел.
                            </span>
                            <span className="text-xs font-black text-blue-500/80">${individualShare.toLocaleString()} <span className="text-[9px] text-gray-600 font-bold uppercase">/ чел</span></span>
                        </div>
                    </div>
                  </div>

                  {/* 4. Actions Column */}
                  <div className="lg:w-[240px] flex items-center justify-end gap-2 shrink-0 border-l border-white/5 pl-6">
                    {isActive ? (
                        <div className="flex items-center gap-2 animate-in slide-in-from-right-2 duration-300">
                             {activeAction.type === 'reject' && (
                                <Input 
                                    autoFocus
                                    placeholder="Причина..."
                                    className="h-8 w-32 bg-[#050505] border-white/10 text-[10px] font-bold"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                />
                             )}
                             <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white"
                                onClick={() => { setActiveAction(null); setRejectionReason(''); }}
                                disabled={isProcessing}
                             >
                                <X className="w-3.5 h-3.5" />
                             </Button>
                             <Button 
                                size="sm" 
                                className={`h-8 px-4 text-[10px] font-black uppercase tracking-widest shadow-lg ${
                                    activeAction.type === 'approve' 
                                        ? 'bg-green-600 hover:bg-green-700 shadow-green-600/10' 
                                        : 'bg-red-600 hover:bg-red-700 shadow-red-600/10'
                                }`}
                                onClick={handleAction}
                                disabled={isProcessing || (activeAction.type === 'reject' && !rejectionReason)}
                             >
                                {isProcessing ? '...' : (activeAction.type === 'approve' ? 'ОК' : 'ДА')}
                             </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                             <Button 
                                size="sm" 
                                className="bg-white/5 hover:bg-green-500/10 border border-white/5 hover:border-green-500/20 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-green-500 h-8 px-4 transition-all duration-300"
                                onClick={() => setActiveAction({ id: report.id, type: 'approve' })}
                             >
                                Одобрить
                             </Button>
                             <Button 
                                size="sm" 
                                className="bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-red-500 h-8 px-4 transition-all duration-300"
                                onClick={() => setActiveAction({ id: report.id, type: 'reject' })}
                             >
                                Отклонить
                             </Button>
                        </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
