'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Clock, FileText, Search, Wallet, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

type Report = {
    id: string;
    contractType: string;
    itemName: string;
    quantity: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    value: number | null;
    userShare: number | null;
    rejectionReason: string | null;
    createdAt: string;
    verifier: {
        firstName: string | null;
        lastName: string | null;
        name: string | null;
    } | null;
};

export default function HistoryPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

    useEffect(() => {
        const fetchReports = async () => {
            try {
                let url = '/api/user/reports?limit=100';
                if (filter !== 'ALL') {
                    url += `&status=${filter}`;
                }
                
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setReports(data);
                }
            } catch (error) {
                console.error('Failed to fetch reports:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [filter]);

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return { 
                    label: 'Одобрено', 
                    color: 'text-emerald-400', 
                    bg: 'bg-emerald-500/10', 
                    border: 'border-emerald-500/20',
                    gradient: 'from-emerald-500/10 via-transparent to-transparent',
                    icon: CheckCircle2 
                };
            case 'REJECTED':
                return { 
                    label: 'Отклонено', 
                    color: 'text-rose-400', 
                    bg: 'bg-rose-500/10', 
                    border: 'border-rose-500/20',
                    gradient: 'from-rose-500/10 via-transparent to-transparent',
                    icon: XCircle 
                };
            default:
                return { 
                    label: 'На проверке', 
                    color: 'text-amber-400', 
                    bg: 'bg-amber-500/10', 
                    border: 'border-amber-500/20',
                    gradient: 'from-amber-500/10 via-transparent to-transparent',
                    icon: Clock 
                };
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="relative overflow-hidden rounded-2xl bg-[#0a0a0a] border border-[#1f1f1f] p-8">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-white/5 to-transparent pointer-events-none" />
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#e81c5a]/20 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                            <FileText className="w-6 h-6 text-gray-300" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight">История отчетов</h1>
                            <p className="text-gray-400 mt-1 text-sm font-medium">Ваш личный журнал активности и заработка</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Filter Tabs */}
            <div className="flex gap-2 pb-2 overflow-x-auto scroolbar-hide">
                {[
                    { id: 'ALL', label: 'Все отчеты' },
                    { id: 'PENDING', label: 'На проверке', dot: 'bg-amber-400' },
                    { id: 'APPROVED', label: 'Одобренные', dot: 'bg-emerald-400' },
                    { id: 'REJECTED', label: 'Отклоненные', dot: 'bg-rose-400' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id as any)}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap border",
                            filter === tab.id
                                ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                                : "bg-[#0a0a0a] border-[#1f1f1f] text-gray-500 hover:text-white hover:bg-white/5 hover:border-white/20"
                        )}
                    >
                        {tab.dot && (
                            <span className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                tab.dot,
                                filter === tab.id && tab.id === 'PENDING' ? "bg-amber-500 animate-pulse" : "",
                                filter === tab.id && tab.id === 'APPROVED' ? "bg-emerald-600" : "",
                                filter === tab.id && tab.id === 'REJECTED' ? "bg-rose-600" : ""
                            )} />
                        )}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Reports List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="py-32 flex flex-col items-center justify-center bg-[#0a0a0a]/50 rounded-2xl border border-[#1f1f1f] border-dashed">
                        <div className="w-10 h-10 border-2 border-[#e81c5a]/20 border-t-[#e81c5a] rounded-full animate-spin mb-4" />
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest animate-pulse">Синхронизация данных...</p>
                    </div>
                ) : reports.length > 0 ? (
                    <div className="grid gap-4">
                        {reports.map((report) => {
                            const status = getStatusInfo(report.status);
                            const StatusIcon = status.icon;

                            return (
                                <Card key={report.id} className={cn(
                                    "relative overflow-hidden bg-[#0a0a0a] hover:bg-[#0f0f0f] border-[#1f1f1f] transition-all duration-300 group",
                                    "hover:shadow-lg hover:-translate-y-0.5"
                                )}>
                                    {/* Status background glow gradient */}
                                    <div className={cn("absolute inset-0 bg-linear-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500", status.gradient)} />
                                    
                                    <CardContent className="p-0">
                                        <div className="flex flex-col md:flex-row relative z-10">
                                            
                                            {/* Left color accent bar */}
                                            <div className={cn("hidden md:block w-1 h-auto transition-colors duration-300", 
                                                report.status === 'APPROVED' ? 'bg-emerald-500/50 group-hover:bg-emerald-400' :
                                                report.status === 'REJECTED' ? 'bg-rose-500/50 group-hover:bg-rose-400' :
                                                'bg-amber-500/50 group-hover:bg-amber-400'
                                            )} />

                                            <div className="flex-1 p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-5">
                                                {/* Status Icon */}
                                                <div className="shrink-0 flex items-center gap-4">
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300", 
                                                        status.bg, status.color, status.border,
                                                        "group-hover:scale-110"
                                                    )}>
                                                        <StatusIcon className="w-6 h-6" />
                                                    </div>
                                                </div>

                                                {/* Main Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h3 className="text-lg font-black text-white tracking-tight truncate">{report.contractType}</h3>
                                                        <span className={cn(
                                                            "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border hidden sm:inline-block", 
                                                            status.bg, status.color, status.border
                                                        )}>
                                                            {status.label}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                                        <span className="font-medium text-gray-300">{report.itemName}</span>
                                                        <span className="w-1 h-1 rounded-full bg-gray-700" />
                                                        <span className="font-mono text-gray-500">{report.quantity} шт.</span>
                                                    </div>

                                                    <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                                                        <span className="flex items-center gap-1.5">
                                                            <Clock className="w-3.5 h-3.5 opacity-70" />
                                                            {new Date(report.createdAt).toLocaleString('ru-RU', { 
                                                                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                                                            })}
                                                        </span>
                                                        {report.verifier && (
                                                            <span className="hidden sm:inline-flex items-center gap-1.5">
                                                                <span className="w-1 h-1 rounded-full bg-gray-700" />
                                                                Проверил: <span className="text-gray-400">{report.verifier.firstName || report.verifier.name}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Financial / Rejection Info */}
                                                <div className={cn(
                                                    "md:w-[220px] shrink-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-white/5",
                                                    "md:pl-6 flex flex-col justify-center transition-all duration-300"
                                                )}>
                                                    {report.status === 'APPROVED' && report.userShare ? (
                                                        <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center">
                                                            <div>
                                                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 md:justify-end">
                                                                    <Wallet className="w-3 h-3 text-emerald-500" /> Доля
                                                                </span>
                                                                <div className="text-2xl font-black text-emerald-400 tracking-tight group-hover:text-emerald-300 transition-colors">
                                                                    +${report.userShare.toLocaleString()}
                                                                </div>
                                                            </div>
                                                            {report.value && (
                                                                <span className="text-[10px] font-medium text-gray-600 mt-1 md:text-right">
                                                                    Общая стоимость: <span className="font-mono">${report.value.toLocaleString()}</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : report.status === 'REJECTED' ? (
                                                        <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-3 relative overflow-hidden group-hover:border-rose-500/20 transition-colors">
                                                            <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 blur-xl rounded-full" />
                                                            <div className="flex items-center gap-1.5 mb-1.5 relative z-10">
                                                                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                                                                <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Причина отказа</span>
                                                            </div>
                                                            <p className="text-xs text-rose-100/70 font-medium leading-relaxed relative z-10 line-clamp-2">
                                                                {report.rejectionReason || "Причина не указана"}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/10 rounded-xl px-4 py-3">
                                                            <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                                                            <span className="text-[11px] font-bold text-amber-500/80 uppercase tracking-widest">
                                                                Ожидает проверки
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-24 flex flex-col items-center justify-center text-center bg-[#0a0a0a]/50 rounded-2xl border border-[#1f1f1f] border-dashed">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-gray-600" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">История пуста</h3>
                        <p className="text-sm text-gray-500 max-w-sm">
                            Отчетов с выбранным статусом не найдено. Начните выполнять контракты, чтобы они появились здесь.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
