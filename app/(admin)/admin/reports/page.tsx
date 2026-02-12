'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Report } from '@prisma/client';
import { Check, Clock, ExternalLink, X } from 'lucide-react';
import { useEffect, useState } from 'react';

// Extend Report type to include user relation
type ReportWithUser = Report & { user: { name: string | null; image: string | null } };

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Action State
  const [actionValue, setActionValue] = useState<string>(''); // For approval value or rejection reason
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
    
    setProcessingId(activeAction.id);
    try {
      const body = {
        reportId: activeAction.id,
        action: activeAction.type,
        ...(activeAction.type === 'approve' ? { value: actionValue } : { rejectionReason: actionValue })
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
        setActionValue('');
      } else {
        alert('Failed to process report');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setProcessingId(null);
    }
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
          {reports.map((report) => (
            <Card key={report.id} className="bg-[#0a0a0a] border border-[#1f1f1f]">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* User Info */}
                  <div className="flex items-start gap-4 min-w-[200px]">
                    {report.user.image ? (
                        <img src={report.user.image} alt={report.user.name || ''} className="w-10 h-10 rounded-full" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-700" />
                    )}
                    <div>
                        <p className="font-bold text-white">{report.user.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                  </div>

                  {/* Report Details */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded bg-white/5 text-xs font-mono text-gray-300 border border-white/10 uppercase">
                            {report.contractType}
                        </span>
                        <h3 className="text-white font-medium">{report.itemName} <span className="text-gray-500">x{report.quantity}</span></h3>
                    </div>
                    
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

                  {/* Actions */}
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    {activeAction?.id === report.id ? (
                        <div className="space-y-2 animate-in fade-in zoom-in-95 bg-[#1a1a1a] p-3 rounded-lg border border-[#2f2f2f]">
                            <p className="text-xs font-bold text-white mb-1">
                                {activeAction.type === 'approve' ? 'Сумма выплаты ($):' : 'Причина отказа:'}
                            </p>
                            <Input 
                                autoFocus
                                type={activeAction.type === 'approve' ? "number" : "text"} 
                                placeholder={activeAction.type === 'approve' ? "Example: 15000" : "Incorrect proof..."}
                                className="h-8 text-xs bg-[#0a0a0a]"
                                value={actionValue}
                                onChange={(e) => setActionValue(e.target.value)}
                            />
                            {activeAction.type === 'approve' && actionValue && !isNaN(parseFloat(actionValue)) && (
                                <div className="text-[10px] space-y-0.5 text-gray-400">
                                    <div className="flex justify-between">
                                        <span>User (60%):</span>
                                        <span className="text-green-500 font-bold">${(parseFloat(actionValue) * 0.6).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Family (40%):</span>
                                        <span className="text-yellow-500 font-bold">${(parseFloat(actionValue) * 0.4).toLocaleString()}</span>
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-2 pt-1">
                                <Button size="sm" variant="ghost" className="h-7 w-full text-xs" onClick={() => setActiveAction(null)}>Cancel</Button>
                                <Button 
                                    size="sm" 
                                    className={`h-7 w-full text-xs ${activeAction.type === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                                    onClick={handleAction}
                                    disabled={!actionValue || processingId === report.id}
                                >
                                    Confirm
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Button 
                                className="bg-green-600 hover:bg-green-700 text-white h-9"
                                onClick={() => {
                                    setActiveAction({ id: report.id, type: 'approve' });
                                    setActionValue('');
                                }}
                            >
                                <Check className="w-4 h-4 mr-2" /> Одобрить
                            </Button>
                             <Button 
                                variant="destructive" 
                                className="bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-900 h-9"
                                onClick={() => {
                                    setActiveAction({ id: report.id, type: 'reject' });
                                    setActionValue('');
                                }}
                            >
                                <X className="w-4 h-4 mr-2" /> Отклонить
                            </Button>
                        </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
