'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { AlertCircle, Calendar, CheckCircle2, ClipboardList, Clock, Coins, FileText, Settings, Trophy, User as UserIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type ProfileData = {
    user: {
        id: string;
        name: string | null;
        firstName: string | null;
        lastName: string | null;
        email: string | null;
        image: string | null;
        role: string;
        rank: number;
        staticId: string | null;
        createdAt: string;
    };
    stats: {
        totalEarned: number;
        totalReports: number;
        approvedReports: number;
        activeContracts: number;
    };
    activeContracts: any[];
    recentActivity: any[];
};

export default function ProfilePage() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    // Settings Form State
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        staticId: "",
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'settings') {
            setActiveTab('settings');
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/user/profile');
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                    setFormData({
                        firstName: data.user.firstName || "",
                        lastName: data.user.lastName || "",
                        staticId: data.user.staticId || "",
                    });
                }
            } catch (error) {
                console.error('Failed to fetch profile:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSettingsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch("/api/user/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Не удалось обновить настройки");

            await update({ ...formData });
            setMessage({ type: 'success', text: 'Профиль успешно обновлен!' });
            router.refresh(); // Refresh server components if any
        } catch (error) {
            setMessage({ type: 'error', text: 'Ошибка при сохранении' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }
    
    if (!profile) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">
            {/* Header / Identity Card */}
            <div className="relative rounded-2xl overflow-hidden bg-[#0a0a0a] border border-[#1f1f1f]">
                {/* Banner */}
                <div className="h-32 bg-linear-to-r from-[#e81c5a]/20 via-purple-900/20 to-blue-900/20" />
                
                <div className="px-8 pb-8 flex flex-col md:flex-row items-end -mt-12 gap-6 relative z-10">
                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-2xl bg-[#0a0a0a] p-1 border border-white/10 shadow-xl">
                        {profile.user.image ? (
                            <img src={profile.user.image} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                            <div className="w-full h-full bg-gray-800 rounded-xl flex items-center justify-center">
                                <UserIcon className="w-8 h-8 text-gray-500" />
                            </div>
                        )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0 mb-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-white tracking-tight truncate">
                                {profile.user.firstName ? `${profile.user.firstName} ${profile.user.lastName || ''}` : profile.user.name}
                            </h1>
                            {profile.user.rank > 0 && (
                                <span className="bg-yellow-500/10 text-yellow-500 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border border-yellow-500/20">
                                    Ранг {profile.user.rank}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mt-1">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-green-500" />
                                {profile.user.role === 'ADMIN' ? 'Администратор' : profile.user.role === 'MODERATOR' ? 'Модератор' : 'Участник'}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="text-gray-600">ID:</span>
                                <span className="font-mono text-gray-300">{profile.user.staticId || '—'}</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                В семье с {new Date(profile.user.createdAt).toLocaleDateString('ru-RU')}
                            </span>
                        </div>
                    </div>

                    {/* Quick Stats (Desktop) */}
                    <div className="hidden md:flex gap-8 mb-2 border-l border-white/10 pl-8">
                         <div className="text-center">
                            <div className="text-2xl font-black text-white">${profile.stats.totalEarned.toLocaleString()}</div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Заработано</div>
                         </div>
                         <div className="text-center">
                            <div className="text-2xl font-black text-white">{profile.stats.approvedReports}</div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Отчетов</div>
                         </div>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-white/10">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={cn(
                        "px-6 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all hover:text-white",
                        activeTab === 'overview' 
                            ? "border-[#e81c5a] text-white" 
                            : "border-transparent text-gray-500 hover:border-white/20"
                    )}
                >
                    Обзор
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={cn(
                        "px-6 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all hover:text-white flex items-center gap-2",
                        activeTab === 'settings' 
                            ? "border-[#e81c5a] text-white" 
                            : "border-transparent text-gray-500 hover:border-white/20"
                    )}
                >
                    <Settings className="w-4 h-4" />
                    Настройки
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Stats & Contracts */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="bg-[#0a0a0a] border-[#1f1f1f]">
                                <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                                    <Coins className="w-8 h-8 text-yellow-500 mb-2 opacity-80" />
                                    <div className="text-xl font-bold text-white">${profile.stats.totalEarned.toLocaleString()}</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Всего заработано</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-[#0a0a0a] border-[#1f1f1f]">
                                <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                                    <FileText className="w-8 h-8 text-blue-500 mb-2 opacity-80" />
                                    <div className="text-xl font-bold text-white">{profile.stats.totalReports}</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Всего отчетов</div>
                                </CardContent>
                            </Card>
                             <Card className="bg-[#0a0a0a] border-[#1f1f1f]">
                                <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                                    <CheckCircle2 className="w-8 h-8 text-green-500 mb-2 opacity-80" />
                                    <div className="text-xl font-bold text-white">{profile.stats.approvedReports}</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Одобрено</div>
                                </CardContent>
                            </Card>
                             <Card className="bg-[#0a0a0a] border-[#1f1f1f]">
                                <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                                    <ClipboardList className="w-8 h-8 text-purple-500 mb-2 opacity-80" />
                                    <div className="text-xl font-bold text-white">{profile.stats.activeContracts}</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Контракты</div>
                                </CardContent>
                            </Card>
                        </div>

                         {/* Recent Activity */}
                         <Card className="bg-[#0a0a0a] border-[#1f1f1f]">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-gray-400" />
                                    Последняя активность
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {profile.recentActivity.length > 0 ? (
                                    <div className="divide-y divide-white/5">
                                        {profile.recentActivity.map((report: any) => (
                                            <div key={report.id} className="p-4 flex items-center justify-between hover:bg-white/2 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-2 h-2 rounded-full",
                                                        report.status === 'APPROVED' ? "bg-green-500" :
                                                        report.status === 'REJECTED' ? "bg-red-500" : "bg-yellow-500"
                                                    )} />
                                                    <div>
                                                        <h4 className="text-sm font-medium text-white line-clamp-1">{report.items}</h4>
                                                        <p className="text-xs text-gray-500">{new Date(report.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    {report.status === 'APPROVED' && (
                                                        <span className="text-green-500 font-bold text-sm">+${report.userShare?.toLocaleString()}</span>
                                                    )}
                                                     <div className="text-[10px] text-gray-600 uppercase tracking-widest mt-0.5">{report.status}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-gray-500 text-sm">Нет недавней активности</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Achievements / Sidebar */}
                    <div className="space-y-8">
                        <Card className="bg-linear-to-br from-[#0a0a0a] to-[#111] border-[#1f1f1f]">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-yellow-500">
                                    <Trophy className="w-5 h-5" />
                                    Достижения
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500 italic text-center py-8">
                                    Система достижений в разработке...
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : (
                /* Settings Tab */
                <div className="max-w-2xl">
                     <Card className="bg-[#0a0a0a] border-[#1f1f1f]">
                        <CardHeader>
                            <CardTitle>Личные данные</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <form onSubmit={handleSettingsSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Имя</label>
                                        <Input
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            placeholder="Ivan"
                                            className="bg-black/50 border-white/10 text-white" 
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Фамилия</label>
                                        <Input
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            placeholder="Ivanov"
                                            className="bg-black/50 border-white/10 text-white" 
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Static ID</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10">#</span>
                                        <Input
                                            name="staticId"
                                            value={formData.staticId}
                                            onChange={(e) => setFormData({ ...formData, staticId: e.target.value })}
                                            placeholder="12345"
                                            className="bg-black/50 border-white/10 text-white pl-8" 
                                            required
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-500">Ваш уникальный идентификатор в игре.</p>
                                </div>

                                {message && (
                                    <div className={cn(
                                        "p-3 rounded-lg text-sm font-medium flex items-center gap-2",
                                        message.type === 'success' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                    )}>
                                        {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                        {message.text}
                                    </div>
                                )}

                                <div className="flex justify-end pt-4 border-t border-white/5">
                                    <Button 
                                        type="submit" 
                                        disabled={saving}
                                        className="bg-[#e81c5a] hover:bg-[#c21548]"
                                    >
                                        {saving ? 'Сохранение...' : 'Сохранить изменения'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
