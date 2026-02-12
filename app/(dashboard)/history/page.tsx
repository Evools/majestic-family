'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Clock, Search, XCircle } from 'lucide-react';
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
                return { label: 'Одобрено', color: 'text-green-500', bg: 'bg-green-500/10', icon: CheckCircle2 };
            case 'REJECTED':
                return { label: 'Отклонено', color: 'text-red-500', bg: 'bg-red-500/10', icon: XCircle };
            default:
                return { label: 'На проверке', color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: Clock };
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">История отчетов</h1>
                    <p className="text-gray-400 mt-1">Отслеживайте статус проверки ваших отчетов.</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 pb-2 overflow-x-auto">
                {[
                    { id: 'ALL', label: 'Все отчеты' },
                    { id: 'PENDING', label: 'На проверке' },
                    { id: 'APPROVED', label: 'Одобренные' },
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

            {/* Reports List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="inline-block w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <p className="text-gray-500 text-xs mt-4 uppercase tracking-widest">Загрузка истории...</p>
                    </div>
                ) : reports.length > 0 ? (
                    reports.map((report) => {
                        const status = getStatusInfo(report.status);
                        const StatusIcon = status.icon;

                        return (
                            <Card key={report.id} className="bg-[#0a0a0a] border-[#1f1f1f] hover:border-white/20 transition-all group">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Status Icon */}
                                        <div className="shrink-0">
                                            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center border", status.bg, status.color, status.bg.replace('/10', '/20'))}>
                                                <StatusIcon className="w-6 h-6" />
                                            </div>
                                        </div>

                                        {/* Main Info */}
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-start justify-between">
                                                <h3 className="text-lg font-bold text-white tracking-tight">{report.contractType}</h3>
                                                <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded", status.bg, status.color)}>
                                                    {status.label}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-400">
                                                Сдано: <span className="text-white font-medium">{report.itemName}</span> &mdash; {report.quantity} шт.
                                            </p>
                                            <div className="flex items-center gap-4 pt-2 text-xs text-gray-500">
                                                <span className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {new Date(report.createdAt).toLocaleString('ru-RU')}
                                                </span>
                                                {report.verifier && (
                                                    <span>
                                                        Проверил: <span className="text-gray-300">{report.verifier.firstName || report.verifier.name}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Financial / Rejection Info */}
                                        <div className="md:text-right flex flex-col justify-center min-w-[140px] border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 mt-2 md:mt-0">
                                            {report.status === 'APPROVED' && report.userShare ? (
                                                <>
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">Ваша доля</span>
                                                    <span className="text-xl font-black text-green-500 tracking-tight">
                                                        +${report.userShare.toLocaleString()}
                                                    </span>
                                                    {report.value && (
                                                        <span className="text-[10px] text-gray-600 block mt-1">
                                                            Общая: ${report.value.toLocaleString()}
                                                        </span>
                                                    )}
                                                </>
                                            ) : report.status === 'REJECTED' ? (
                                                <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3 text-left">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Причина отказа</span>
                                                    </div>
                                                    <p className="text-xs text-gray-300 leading-relaxed">
                                                        {report.rejectionReason || "Причина не указана"}
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-500 italic">
                                                    Ожидает проверки руководством...
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                ) : (
                    <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl">
                        <Search className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                        <h3 className="text-gray-500 font-medium">История пуста</h3>
                        <p className="text-xs text-gray-600 mt-1 uppercase tracking-widest">Отчетов с выбранным статусом не найдено</p>
                    </div>
                )}
            </div>
        </div>
    );
}
