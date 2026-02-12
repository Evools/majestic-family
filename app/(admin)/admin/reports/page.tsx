'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Report } from '@prisma/client';
import { Check, Clock, DollarSign, ExternalLink, Star, Users, X } from 'lucide-react';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Проверка отчетов</h1>
        <p className="text-gray-400">Одобрение и отклонение отчетов участников.</p>
      </div>
      
      {reports.length === 0 ? (
        <Card className="bg-[#0a0a0a] border border-[#1f1f1f]">
            <CardContent className="p-8 text-center text-gray-500">
                Нет ожидающих отчетов.
            </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => {
            const participantCount = report.participants.length;
            // Get reward from contract (this is the total value)
            const contractReward = report.userContract?.contract?.reward || 0;
            const totalValue = contractReward;
            // Family gets 40% of total
            const familyShare = totalValue * 0.4;
            // Users get 60% of total
            const userShare = totalValue * 0.6;
            // Each participant gets equal share
            const individualShare = participantCount > 0 ? userShare / participantCount : 0;

            return (
              <Card key={report.id} className="bg-[#0a0a0a] border border-[#1f1f1f]">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-6">
                    {/* Header: User Info + Contract */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        {report.user.image ? (
                            <img src={report.user.image} alt={getUserDisplayName(report.user)} className="w-10 h-10 rounded-full" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-700" />
                        )}
                        <div>
                            <p className="font-bold text-white">{getUserDisplayName(report.user)}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(report.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                      </div>

                      {/* Contract Badge */}
                      {report.userContract?.contract && (
                        <div className="flex flex-col items-end gap-1">
                          <div className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                            <span className="text-sm font-bold text-green-500">{report.userContract.contract.title}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className="flex items-center gap-1 text-green-500">
                              <DollarSign className="w-3 h-3" />
                              <span className="font-bold">${contractReward.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1 text-yellow-500">
                              <Star className="w-3 h-3" />
                              <span className="font-bold">+{report.userContract.contract.reputation} XP</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Participants */}
                    {participantCount > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-bold text-blue-500">{participantCount} участник{participantCount > 1 ? 'а' : ''}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {report.participants.map((participant) => (
                            <div key={participant.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                              {participant.user.image ? (
                                <img src={participant.user.image} alt={getUserDisplayName(participant.user)} className="w-5 h-5 rounded-full" />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-gray-700" />
                              )}
                              <span className="text-xs text-gray-300">{getUserDisplayName(participant.user)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Report Details */}
                    <div className="space-y-2">
                      <h3 className="text-white font-medium">{report.itemName} <span className="text-gray-500">x{report.quantity}</span></h3>
                      
                      {report.comment && (
                          <p className="text-sm text-gray-400 bg-white/5 p-2 rounded border border-white/5">
                              "{report.comment}"
                          </p>
                      )}
                      
                      <a 
                          href={report.proof} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-xs text-[#e81c5a] hover:underline"
                      >
                          <ExternalLink className="w-3 h-3" />
                          Смотреть доказательства
                      </a>
                    </div>

                    {/* Payment Distribution Preview */}
                    {contractReward > 0 && (
                      <div className="space-y-2 p-3 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Автоматическое распределение:</p>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Награда контракта:</span>
                            <span className="text-white font-bold">${totalValue.toLocaleString()}</span>
                          </div>
                          <div className="h-px bg-white/10 my-1" />
                          <div className="flex justify-between">
                            <span className="text-gray-400">Семье (40%):</span>
                            <span className="text-yellow-500 font-bold">${familyShare.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Участникам (60%):</span>
                            <span className="text-green-500 font-bold">${userShare.toLocaleString()}</span>
                          </div>
                          <div className="h-px bg-white/10 my-2" />
                          <div className="flex justify-between">
                            <span className="text-gray-400">Каждому участнику:</span>
                            <span className="text-blue-500 font-bold">${individualShare.toLocaleString()}</span>
                          </div>
                          {participantCount > 0 && (
                            <p className="text-[10px] text-gray-500 mt-1">
                              ${userShare.toLocaleString()} ÷ {participantCount} участник{participantCount > 1 ? 'а' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {activeAction?.id === report.id ? (
                          <div className="space-y-3 animate-in fade-in zoom-in-95 bg-[#1a1a1a] p-4 rounded-lg border border-[#2f2f2f]">
                              {activeAction.type === 'reject' ? (
                                <>
                                  <p className="text-xs font-bold text-white mb-1">Причина отказа:</p>
                                  <Input 
                                      autoFocus
                                      type="text" 
                                      placeholder="Incorrect proof..."
                                      className="h-9 text-sm bg-[#0a0a0a]"
                                      value={rejectionReason}
                                      onChange={(e) => setRejectionReason(e.target.value)}
                                  />
                                </>
                              ) : (
                                <p className="text-sm text-green-500">
                                  Подтвердите одобрение отчета. Средства будут распределены автоматически согласно контракту.
                                </p>
                              )}
                              <div className="flex gap-2 pt-1">
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-8 w-full text-xs" 
                                    onClick={() => {
                                      setActiveAction(null);
                                      setRejectionReason('');
                                    }}
                                  >
                                    Отмена
                                  </Button>
                                  <Button 
                                      size="sm" 
                                      className={`h-8 w-full text-xs font-medium ${
                                        activeAction.type === 'approve' 
                                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                                          : 'bg-red-600 hover:bg-red-700 text-white'
                                      }`}
                                      onClick={handleAction}
                                      disabled={(activeAction.type === 'reject' && !rejectionReason) || processingId === report.id}
                                  >
                                      {processingId === report.id ? 'Обработка...' : 'Подтвердить'}
                                  </Button>
                              </div>
                          </div>
                      ) : (
                          <div className="flex gap-2">
                              <Button 
                                  className="bg-green-600 hover:bg-green-700 text-white h-9 flex-1 font-medium"
                                  onClick={() => {
                                      setActiveAction({ id: report.id, type: 'approve' });
                                      setRejectionReason('');
                                  }}
                              >
                                  <Check className="w-4 h-4 mr-2" /> Одобрить
                              </Button>
                               <Button 
                                  variant="outline" 
                                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30 hover:border-red-500/50 h-9 flex-1 font-medium"
                                  onClick={() => {
                                      setActiveAction({ id: report.id, type: 'reject' });
                                      setRejectionReason('');
                                  }}
                              >
                                  <X className="w-4 h-4 mr-2" /> Отклонить
                              </Button>
                          </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
