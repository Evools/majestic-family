'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Clock, Coins, PiggyBank, Receipt, TrendingUp, Wallet, XCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

type PayoutRequest = {
    id: string;
    amount: number;
    status: 'PENDING' | 'PAID' | 'REJECTED';
    createdAt: string;
};

export default function WalletPage() {
    const { data: session } = useSession();
    const [balance, setBalance] = useState({ available: 0, totalEarned: 0 });
    const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [requestAmount, setRequestAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/user/payout');
            if (res.ok) {
                const data = await res.json();
                setBalance({
                    available: data.availableBalance,
                    totalEarned: data.totalEarned
                });
                setPayouts(data.payouts || []);
            }
        } catch (error) {
            console.error('Failed to fetch wallet data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRequestPayout = async () => {
        if (!requestAmount) return;
        
        setIsSubmitting(true);
        setMessage(null);

        try {
            const res = await fetch('/api/user/payout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: requestAmount })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: 'Запрос на выплату успешно создан!' });
                setRequestAmount('');
                await fetchData(); // Refresh data
            } else {
                setMessage({ type: 'error', text: data.error || 'Ошибка при создании запроса' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Произошла ошибка сети' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'PAID':
                return { label: 'Выплачено', color: 'text-green-500', bg: 'bg-green-500/10', icon: CheckCircle2 };
            case 'REJECTED':
                return { label: 'Отклонено', color: 'text-red-500', bg: 'bg-red-500/10', icon: XCircle };
            default:
                return { label: 'В обработке', color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: Clock };
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Мой Кошелек</h1>
                    <p className="text-gray-400 mt-1">Управление финансами и запросами на выплату.</p>
                </div>
            </div>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Balance */}
                <Card className="bg-linear-to-r from-green-900/40 to-emerald-900/40 border-green-500/20 overflow-hidden relative md:col-span-2">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Wallet className="w-48 h-48 text-green-500 transform rotate-12" />
                    </div>
                    <CardContent className="p-8 relative z-10 flex flex-col md:flex-row items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-green-500/20 text-green-500">
                                    <Wallet className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-bold text-green-500 uppercase tracking-widest">Доступно к выводу</span>
                            </div>
                            <h2 className="text-5xl font-black text-white mb-2 tabular-nums tracking-tight">
                                ${balance.available.toLocaleString()}
                            </h2>
                            <p className="text-green-400/60 text-sm font-medium">
                                Ваш текущий баланс
                            </p>
                        </div>
                        
                        <div className="w-full md:w-auto bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/5 space-y-3">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Запросить выплату</h4>
                            <div className="flex gap-2">
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                                    <Input 
                                        type="number" 
                                        placeholder="10000" 
                                        value={requestAmount}
                                        onChange={(e) => setRequestAmount(e.target.value)}
                                        className="pl-6 bg-black/50 border-white/10 text-white w-32"
                                    />
                                </div>
                                <Button 
                                    onClick={handleRequestPayout}
                                    disabled={isSubmitting || !requestAmount || parseFloat(requestAmount) > balance.available || parseFloat(requestAmount) <= 0}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-600/20"
                                >
                                    {isSubmitting ? '...' : (
                                        <>
                                            Запросить <Receipt className="w-4 h-4 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </div>
                            {message && (
                                <p className={cn("text-[10px] font-bold uppercase tracking-widest", message.type === 'error' ? "text-red-500" : "text-green-500")}>
                                    {message.text}
                                </p>
                            )}
                            <p className="text-[10px] text-gray-600 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Мин. сумма вывода: $10,000
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Earned */}
                <Card className="bg-[#0a0a0a] border-[#1f1f1f]">
                    <CardContent className="p-8 h-full flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                <PiggyBank className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Всего заработано</span>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2 tabular-nums">
                            ${balance.totalEarned.toLocaleString()}
                        </h2>
                        <div className="flex items-center text-xs text-gray-500 gap-1 mt-auto">
                            <TrendingUp className="w-3 h-3 text-green-500" />
                            <span className="text-green-500 font-bold">100%</span>
                            <span>за всё время</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Payout History */}
            <Card className="bg-[#0a0a0a] border-[#1f1f1f]">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">История выплат</h3>
                    <div className="flex gap-2">
                         <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Coins className="w-4 h-4" />
                            <span>Только подтвержденные транзакции</span>
                         </div>
                    </div>
                </div>
                
                <div className="p-0">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500">Загрузка данных...</div>
                    ) : payouts.length > 0 ? (
                        <div className="divide-y divide-white/5">
                            {payouts.map((tx) => {
                                const status = getStatusInfo(tx.status);
                                const StatusIcon = status.icon;

                                return (
                                    <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-white/2 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center border", status.bg, status.color, status.bg.replace('/10', '/20'))}>
                                                <StatusIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white text-sm">Выплата средств</h4>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-white text-sm">
                                                -${tx.amount.toLocaleString()}
                                            </div>
                                            <div className={cn("text-[10px] font-bold uppercase tracking-widest mt-0.5", status.color)}>
                                                {status.label}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <Receipt className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                            <h3 className="text-gray-500 font-medium">История пуста</h3>
                            <p className="text-xs text-gray-600 mt-1">Вы еще не запрашивали выплаты.</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
