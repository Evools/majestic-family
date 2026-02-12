'use client';

import { ConfirmationModal } from '@/components/confirmation-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Check, CheckCircle2, Clock, Filter, X, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

type Payout = {
    id: string;
    amount: number;
    status: 'PENDING' | 'PAID' | 'REJECTED';
    createdAt: string;
    user: {
        id: string;
        name: string | null;
        firstName: string | null;
        lastName: string | null;
        image: string | null;
        staticId: string | null;
    };
};

export default function AdminPayoutsPage() {
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'PAID' | 'REJECTED'>('PENDING');
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Modal State
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        type: 'approve' | 'reject';
        payoutId: string | null;
        amount?: number;
    }>({
        isOpen: false,
        type: 'approve',
        payoutId: null
    });

    const fetchPayouts = async () => {
        setLoading(true);
        try {
            let url = '/api/admin/payouts';
            if (filter !== 'ALL') {
                url += `?status=${filter}`;
            }
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setPayouts(data);
            }
        } catch (error) {
            console.error('Failed to fetch payouts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayouts();
    }, [filter]);

    const openConfirmModal = (id: string, type: 'approve' | 'reject', amount: number) => {
        setModalConfig({
            isOpen: true,
            type,
            payoutId: id,
            amount
        });
    };

    const handleConfirmAction = async () => {
        const { payoutId, type } = modalConfig;
        if (!payoutId) return;

        setProcessingId(payoutId);
        try {
            const res = await fetch('/api/admin/payouts', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: payoutId, action: type })
            });

            if (res.ok) {
                // Update local state
                setPayouts(prev => prev.map(p => 
                    p.id === payoutId 
                        ? { ...p, status: type === 'approve' ? 'PAID' : 'REJECTED' } 
                        : p
                ));
                
                if (filter === 'PENDING') {
                    setPayouts(prev => prev.filter(p => p.id !== payoutId));
                }
            } else {
                alert('Ошибка при обработке запроса'); // Ideally user a toast here
            }
        } catch (error) {
            console.error('Action failed:', error);
        } finally {
            setProcessingId(null);
            setModalConfig(prev => ({ ...prev, isOpen: false }));
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'PAID':
                return { label: 'Выплачено', color: 'text-green-500', bg: 'bg-green-500/10', icon: CheckCircle2 };
            case 'REJECTED':
                return { label: 'Отклонено', color: 'text-red-500', bg: 'bg-red-500/10', icon: XCircle };
            default:
                return { label: 'Ожидает', color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: Clock };
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Запросы на выплату</h1>
                    <p className="text-gray-400 mt-1">Обработка заявок на вывод средств.</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 pb-2 overflow-x-auto">
                {[
                    { id: 'ALL', label: 'Все' },
                    { id: 'PENDING', label: 'Ожидают' },
                    { id: 'PAID', label: 'Выплаченные' },
                    { id: 'REJECTED', label: 'Отклоненные' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id as any)}
                        className={cn(
                            "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                            filter === tab.id
                                ? "bg-white text-black"
                                : "bg-[#0a0a0a] border border-[#1f1f1f] text-gray-500 hover:text-white hover:border-white/20"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Payouts List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="inline-block w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <p className="text-gray-500 text-xs mt-4 uppercase tracking-widest">Загрузка запросов...</p>
                    </div>
                ) : payouts.length > 0 ? (
                    payouts.map((payout) => {
                        const status = getStatusInfo(payout.status);
                        const StatusIcon = status.icon;
                        const isProcessing = processingId === payout.id;

                        return (
                            <Card key={payout.id} className="bg-[#0a0a0a] border-[#1f1f1f] hover:border-white/20 transition-all group">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                                        {/* Status Icon */}
                                        <div className="shrink-0 hidden md:block">
                                            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center border", status.bg, status.color, status.bg.replace('/10', '/20'))}>
                                                <StatusIcon className="w-6 h-6" />
                                            </div>
                                        </div>

                                        {/* User Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden shrink-0">
                                                    {payout.user.image && <img src={payout.user.image} className="w-full h-full object-cover" />}
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-bold truncate">
                                                        {payout.user.firstName ? `${payout.user.firstName} ${payout.user.lastName || ''}` : payout.user.name}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 font-mono">ID: {payout.user.staticId || '—'}</p>
                                                </div>
                                                <span className={cn("ml-2 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded md:hidden", status.bg, status.color)}>
                                                    {status.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {new Date(payout.createdAt).toLocaleString('ru-RU')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Amount */}
                                        <div className="text-left md:text-right min-w-[120px] pl-12 md:pl-0">
                                            <div className="text-2xl font-black text-white tracking-tight">
                                                ${payout.amount.toLocaleString()}
                                            </div>
                                            <div className={cn("text-[10px] font-bold uppercase tracking-widest mt-1 hidden md:block", status.color)}>
                                                {status.label}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        {payout.status === 'PENDING' && (
                                            <div className="flex items-center gap-3 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-white/5 md:pl-6">
                                                <Button
                                                    size="sm"
                                                    disabled={isProcessing}
                                                    onClick={() => openConfirmModal(payout.id, 'reject', payout.amount)}
                                                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20"
                                                >
                                                    <X className="w-4 h-4 mr-2" />
                                                    Отклонить
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    disabled={isProcessing}
                                                    onClick={() => openConfirmModal(payout.id, 'approve', payout.amount)}
                                                    className="bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20"
                                                >
                                                    <Check className="w-4 h-4 mr-2" />
                                                    Выплатить
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                ) : (
                    <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl">
                        <Filter className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                        <h3 className="text-gray-500 font-medium">Заявок нет</h3>
                        <p className="text-xs text-gray-600 mt-1 uppercase tracking-widest">
                            {filter === 'PENDING' ? 'Все заявки обработаны' : 'Список пуст'}
                        </p>
                    </div>
                )}
            </div>

            <ConfirmationModal 
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={handleConfirmAction}
                title={modalConfig.type === 'approve' ? 'Подтвердите выплату' : 'Отклонить запрос'}
                description={modalConfig.type === 'approve' 
                    ? `Вы уверены, что перевели $${modalConfig.amount?.toLocaleString()} игроку и хотите закрыть эту заявку?` 
                    : `Вы уверены, что хотите отклонить этот запрос на выплату? Средства останутся на балансе игрока.`
                }
                confirmText={modalConfig.type === 'approve' ? 'Подтвердить выплату' : 'Отклонить запрос'}
                variant={modalConfig.type === 'approve' ? 'success' : 'danger'}
                loading={processingId !== null}
            />
        </div>
    );
}
