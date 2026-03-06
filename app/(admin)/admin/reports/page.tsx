'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox";
import { CustomSelect } from "@/components/ui/custom-select";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Report } from '@prisma/client';
import {
  AlertTriangle,
  ArrowUpDown,
  Check,
  CheckSquare,
  Maximize2,
  Search,
  Square,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

// Extend Report type to include relations
type ReportWithRelations = Report & {
  user: { name: string | null; image: string | null; firstName: string | null; lastName: string | null };
  userContract: {
    cycleNumber: number;
    contract: {
      id: string;
      title: string;
      reward: number;
      maxSlots: number;
      isFlexible: boolean;
      reputation: number;
      category: string | null;
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

  // Power Features State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [isBatchConfirmOpen, setIsBatchConfirmOpen] = useState(false);

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

    // For approval, no value needed anymore
    // const contractReward = report.userContract?.contract?.reward || 0;
    
    setProcessingId(activeAction.id);
    try {
      const body = {
        reportId: activeAction.id,
        action: activeAction.type,
        ...(activeAction.type === 'reject' && { rejectionReason })
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

  // Filter & Sort Logic
  const categories = useMemo(() => {
    const cats = new Set<string>();
    reports.forEach(r => {
        if (r.userContract?.contract?.category) cats.add(r.userContract.contract.category);
    });
    return Array.from(cats);
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports
        .filter(report => {
            const userName = getUserDisplayName(report.user).toLowerCase();
            const contractTitle = (report.userContract?.contract?.title || '').toLowerCase();
            const matchesSearch = userName.includes(searchTerm.toLowerCase()) || contractTitle.includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || report.userContract?.contract?.category === categoryFilter;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
  }, [reports, searchTerm, categoryFilter, sortOrder]);

  // Batch Selection Logic
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredReports.length) {
        setSelectedIds(new Set());
    } else {
        setSelectedIds(new Set(filteredReports.map(r => r.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBatchApprove = async () => {
    if (selectedIds.size === 0) return;
    setIsBatchConfirmOpen(false);

    setLoading(true);
    let successCount = 0;
    
    for (const id of Array.from(selectedIds)) {
        const report = reports.find(r => r.id === id);
        if (!report) continue;

        try {
            const res = await fetch('/api/admin/reports', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reportId: id,
                    action: 'approve'
                }),
            });
            if (res.ok) successCount++;
        } catch (e) {
            console.error(`Failed to approve ${id}`, e);
        }
    }

    alert(`Успешно одобрено: ${successCount} из ${selectedIds.size}`);
    setSelectedIds(new Set());
    fetchReports();
  };

  // Calculate Stats based on filtered data
  const stats = {
    pending: filteredReports.length,
    totalValue: filteredReports.reduce((acc: number, r: ReportWithRelations) => acc + (r.userContract?.contract?.reward || 0), 0),
    totalParticipants: filteredReports.reduce((acc: number, r: ReportWithRelations) => acc + r.participants.length, 0),
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

      {/* Toolbar: Search, Filter, Sort, Batch Actions */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between p-4 rounded-2xl bg-white/2 border border-white/5">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input 
                    placeholder="Поиск игрока или контракта..." 
                    className="pl-10 h-10 bg-white/5 border-white/10 text-xs font-bold focus-visible:ring-[#e81c5a]/30"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <CustomSelect
                value={categoryFilter} 
                onChange={setCategoryFilter}
                placeholder="Все категории"
                options={[
                    { value: 'all', label: 'Все категории' },
                    ...categories.map(cat => ({ value: cat, label: cat }))
                ]}
                className="w-full md:w-44 font-bold"
            />

            <Button 
                variant="ghost" 
                size="sm"
                className="h-10 px-3 bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-gray-400 gap-2"
                onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            >
                <ArrowUpDown className="w-3.5 h-3.5" />
                {sortOrder === 'desc' ? 'Сначала новые' : 'Сначала старые'}
            </Button>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto border-t lg:border-t-0 border-white/5 pt-4 lg:pt-0">
            <Button 
                variant="ghost" 
                size="sm"
                className={`h-10 px-4 text-xs font-black uppercase tracking-widest gap-2 transition-all ${selectedIds.size > 0 ? 'text-white bg-white/10' : 'text-gray-500 hover:text-white'}`}
                onClick={toggleSelectAll}
            >
                {selectedIds.size === filteredReports.length && filteredReports.length > 0 ? <CheckSquare className="w-4 h-4 text-[#e81c5a]" /> : <Square className="w-4 h-4" />}
                Выбрать все
            </Button>
            
            {selectedIds.size > 0 && (
                <Button 
                    size="sm"
                    className="h-10 px-6 bg-green-600 hover:bg-green-700 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-600/20 animate-in zoom-in-95 duration-200"
                    onClick={() => setIsBatchConfirmOpen(true)}
                >
                    Одобрить ({selectedIds.size})
                </Button>
            )}
        </div>
      </div>
      
      {filteredReports.length === 0 ? (
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredReports.map((report) => {
            const participantCount = report.participants.length;
            const contractReward = report.userContract?.contract?.reward || 0;
            const contract = report.userContract?.contract;
            const maxSlots = contract?.maxSlots || 1;
            const isFlexible = contract?.isFlexible || false;
            const cycleNumber = report.userContract?.cycleNumber || 1;
            
            // For display purposes in admin panel, we'll use maxSlots for fixed contracts
            // The actual calculation happens in the API based on real signer count
            // This is just for preview/display
            const rewardDivisionCount = maxSlots;
            
            // Calculate per-participant share: reward divided by participant count
            const rewardPerParticipant = contractReward / rewardDivisionCount;
            const individualShare = rewardPerParticipant * 0.6;
            const familySharePerParticipant = rewardPerParticipant * 0.4;
            
            // Total shares for all participants in this report
            const userShare = individualShare * participantCount;
            const familyShare = familySharePerParticipant * participantCount;
            const isProcessing = processingId === report.id;
            const isActive = activeAction?.id === report.id;

            return (
              <Card 
                key={report.id} 
                className={`group relative h-full bg-[#0a0a0a] border ${isActive ? 'border-[#e81c5a]/40 shadow-[0_0_20px_rgba(232,28,90,0.1)]' : (selectedIds.has(report.id) ? 'border-[#e81c5a]/60 bg-[#e81c5a]/5' : 'border-[#1f1f1f] hover:border-white/10')} rounded-xl transition-all duration-300 flex flex-col overflow-hidden`}
              >
                {/* Selection Overlay/Checkbox */}
                <div 
                    className={`absolute top-3 right-3 z-10 transition-all duration-200 ${selectedIds.has(report.id) ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-100 scale-100'}`}
                    onClick={(e) => { e.stopPropagation(); toggleSelect(report.id); }}
                >
                    <Checkbox 
                        checked={selectedIds.has(report.id)} 
                        onChange={() => {}}
                        className="w-5 h-5 bg-[#0a0a0a] border-white/20 data-[state=checked]:bg-[#e81c5a] data-[state=checked]:border-[#e81c5a]"
                    />
                </div>

                <CardContent className="p-0 flex flex-col h-full">
                  {/* Header: Author & Time */}
                  <div className="p-4 border-b border-white/5 bg-white/2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            {report.user.image ? (
                                <img src={report.user.image} alt="" className="w-9 h-9 rounded-lg object-cover border border-white/10" />
                            ) : (
                                <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                                    <Users className="w-4 h-4 text-gray-600" />
                                </div>
                            )}
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[#0a0a0a]" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[13px] font-black text-white truncate" title={getUserDisplayName(report.user)}>
                                {getUserDisplayName(report.user)}
                            </p>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                                {new Date(report.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                  </div>

                  {/* Body: Contract & Proofs */}
                  <div className="p-5 space-y-5 flex-1">
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <Link href={`/admin/contracts?edit=${report.userContract?.contract?.id}`} className="text-[9px] font-black text-white bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded uppercase tracking-widest hover:bg-green-500/20 transition-all">
                                {report.userContract?.contract?.title || 'Contract'}
                            </Link>
                            <span className="text-[9px] font-black text-gray-400 border border-white/5 px-2 py-0.5 rounded uppercase tracking-widest bg-white/2">
                                x{report.quantity} {report.itemName}
                            </span>
                        </div>
                        
                        {/* Proof Thumbnails */}
                        <div className="grid grid-cols-3 gap-2">
                            {report.proof ? (
                                report.proof.split(',').filter(Boolean).map((url, index) => (
                                    <button 
                                        key={index}
                                        onClick={() => setLightboxUrl(url)}
                                        className="relative aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-[#e81c5a] transition-all"
                                    >
                                        <img src={url} alt={`Proof ${index + 1}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                                            <Maximize2 className="w-3.5 h-3.5 text-white" />
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="col-span-3 h-16 flex items-center justify-center rounded-lg bg-red-500/5 border border-red-500/10 text-[9px] font-bold text-red-500 outreach uppercase tracking-widest">
                                    Нет доказательств
                                </div>
                            )}
                        </div>

                        {report.comment && (
                            <div className="p-2.5 rounded-lg bg-white/2 border border-white/5 text-[10px] text-gray-400 font-normal leading-relaxed italic line-clamp-2 hover:line-clamp-none transition-all">
                                "{report.comment}"
                            </div>
                        )}
                    </div>

                    {/* Reward & Participation Breakdown */}
                    <div className="space-y-3 pt-3 border-t border-white/5">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-2.5 rounded-xl bg-white/2 border border-white/5 flex flex-col gap-1">
                                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Семья 40%</span>
                                <span className="text-sm font-black text-yellow-500">${familyShare.toLocaleString()}</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/2 border border-white/5 flex flex-col gap-1">
                                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Игроки 60%</span>
                                <span className="text-sm font-black text-green-500">${userShare.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-white/2 border border-white/5 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5 text-blue-500/80" /> {participantCount} чел.
                                </span>
                                <span className="text-[10px] font-black text-blue-500">
                                    ${individualShare.toLocaleString()} <span className="text-[8px] text-gray-600">/ чел</span>
                                </span>
                            </div>

                            {participantCount > 0 && (
                                <div className="flex -space-x-2">
                                    {report.participants.map((p) => (
                                        <div 
                                            key={p.user.id} 
                                            className="relative inline-block"
                                            title={getUserDisplayName(p.user)}
                                        >
                                            {p.user.image ? (
                                                <img src={p.user.image} alt="" className="w-6 h-6 rounded-full object-cover ring-2 ring-[#0a0a0a] border border-white/10" />
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-white/5 ring-2 ring-[#0a0a0a] border border-white/10 flex items-center justify-center text-[8px] font-bold text-gray-500">
                                                    {p.user.firstName?.[0] || p.user.name?.[0] || '?'}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                  </div>

                  {/* Footer: Actions */}
                  <div className="p-4 border-t border-white/5 bg-[#0a0a0a]">
                    {isActive ? (
                        <div className="flex flex-col gap-3 animate-in slide-in-from-bottom-2 duration-300">
                             {activeAction.type === 'reject' && (
                                <Input 
                                    autoFocus
                                    placeholder="Причина отклонения..."
                                    className="h-10 bg-[#050505] border-white/10 text-xs font-bold focus-visible:ring-[#e81c5a]/30"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                />
                             )}
                             <div className="grid grid-cols-2 gap-2">
                                 <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-10 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white hover:bg-white/5"
                                    onClick={() => { setActiveAction(null); setRejectionReason(''); }}
                                    disabled={isProcessing}
                                 >
                                    Отмена
                                 </Button>
                                 <Button 
                                    size="sm" 
                                    className={`h-10 text-[10px] font-black uppercase tracking-widest transition-all ${
                                        activeAction.type === 'approve' 
                                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20' 
                                            : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20'
                                    }`}
                                    onClick={handleAction}
                                    disabled={isProcessing || (activeAction.type === 'reject' && !rejectionReason)}
                                 >
                                    {isProcessing ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (activeAction.type === 'approve' ? 'ОДОБРИТЬ' : 'ДА, ОТКЛОНИТЬ')}
                                 </Button>
                             </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2">
                             <Button 
                                size="sm" 
                                className="bg-[#e81c5a] hover:bg-[#c21548] text-white text-[10px] font-black uppercase tracking-widest h-10 transition-all active:scale-95 shadow-lg shadow-[#e81c5a]/20"
                                onClick={() => setActiveAction({ id: report.id, type: 'approve' })}
                             >
                                Одобрить
                             </Button>
                             <Button 
                                size="sm" 
                                className="bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white h-10 transition-all active:scale-95"
                                onClick={() => setActiveAction({ id: report.id, type: 'reject' })}
                             >
                                Отклонить
                             </Button>
                        </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Lightbox Dialog */}
      <Dialog open={!!lightboxUrl} onOpenChange={(open: boolean) => !open && setLightboxUrl(null)} className="max-w-7xl">
        <DialogHeader className="max-w-7xl mx-auto w-full">
          <DialogTitle>Просмотр доказательства</DialogTitle>
        </DialogHeader>
        <div className="relative mt-2 max-w-7xl mx-auto w-full flex items-center justify-center">
          <img 
              src={lightboxUrl || ''} 
              alt="Proof Preview" 
              className="w-full max-h-[85vh] object-contain rounded-lg border border-white/10 shadow-2xl"
          />
        </div>
      </Dialog>
      
      {/* Batch Approval Confirmation */}
      <Dialog open={isBatchConfirmOpen} onOpenChange={setIsBatchConfirmOpen}>
        <div className="flex flex-col items-center text-center py-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-green-500" />
            </div>
            
            <DialogHeader>
                <DialogTitle className="text-2xl font-black text-white mb-2">Подтвердите действие</DialogTitle>
                <DialogDescription className="text-gray-400 font-medium">
                    Вы собираетесь массово одобрить <span className="text-white font-bold">{selectedIds.size}</span> отчетов. 
                    Деньги и опыт будут распределены между участниками автоматически.
                </DialogDescription>
            </DialogHeader>

            <DialogFooter className="w-full grid grid-cols-2 gap-3 mt-8">
                <Button 
                    variant="ghost" 
                    className="h-12 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white bg-white/5 border-white/5"
                    onClick={() => setIsBatchConfirmOpen(false)}
                >
                    Отмена
                </Button>
                <Button 
                    className="h-12 bg-green-600 hover:bg-green-700 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-green-600/20"
                    onClick={handleBatchApprove}
                >
                    Одобрить все
                </Button>
            </DialogFooter>
        </div>
      </Dialog>
    </div>
  );
}
