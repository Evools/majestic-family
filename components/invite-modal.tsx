'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Copy, ExternalLink, MessageSquare, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface InviteModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function InviteModal({ isOpen, onClose }: InviteModalProps) {
    const [copied, setCopied] = useState<string | null>(null);
    const [discordUrl, setDiscordUrl] = useState('https://discord.gg/2SUyxyyQPx');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/admin/settings');
                if (res.ok) {
                    const data = await res.json();
                    if (data.discordWebhook) {
                    }
                }
            } catch (err) {
                console.error('Failed to fetch settings', err);
            }
        };
        if (isOpen) fetchSettings();
    }, [isOpen]);

    if (!isOpen) return null;

    const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const recruitMessage = `Семья Shelby ищет активных бойцов! ЗП, контракты, дружный коллектив. Наш портал: ${siteUrl}`;

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-lg animate-in zoom-in-95 duration-300">
                <Card className="bg-[#0a0a0a] border-white/10 overflow-hidden shadow-2xl">
                    <div className="h-1 bg-[#e81c5a]" />
                    
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-tight">Пригласить в семью</h2>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Поделитесь ссылками с новыми участниками</p>
                            </div>
                            <button 
                                onClick={onClose}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Discord Link */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Discord Семьи</label>
                                <div className="flex gap-2">
                                    <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 flex items-center text-sm text-white font-medium">
                                        {discordUrl}
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        className="border-white/10 hover:bg-white/10 text-white gap-2 h-11"
                                        onClick={() => copyToClipboard(discordUrl, 'discord')}
                                    >
                                        {copied === 'discord' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                        <span className="text-[10px] font-black uppercase tracking-widest">Копия</span>
                                    </Button>
                                    <a 
                                        href={discordUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="h-11 px-5 inline-flex items-center justify-center rounded-lg font-medium transition-all active:scale-95 uppercase tracking-wide text-xs bg-[#5865F2] hover:bg-[#4752C4] text-white"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>

                            {/* Portal Link */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Наш портал (для логина)</label>
                                <div className="flex gap-2">
                                    <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 flex items-center text-sm text-white font-medium truncate">
                                        {siteUrl}
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        className="border-white/10 hover:bg-white/10 text-white gap-2 h-11"
                                        onClick={() => copyToClipboard(siteUrl, 'portal')}
                                    >
                                        {copied === 'portal' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                        <span className="text-[10px] font-black uppercase tracking-widest">Копия</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Recruit Message */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Для игрового чата (Recruitment)</label>
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 relative group">
                                    <p className="text-xs text-gray-400 font-medium leading-relaxed italic pr-12">
                                        "{recruitMessage}"
                                    </p>
                                    <Button 
                                        size="sm"
                                        className="absolute top-3 right-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white h-8"
                                        onClick={() => copyToClipboard(recruitMessage, 'recruit')}
                                    >
                                        {copied === 'recruit' ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5 flex items-start gap-4 p-4 rounded-2xl bg-blue-500/5">
                            <MessageSquare className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                                За каждого приглашенного активного игрока полагается премия <span className="text-white">XP</span> и <span className="text-white">$5,000</span>. Убедитесь, что новичок привязал свой <span className="text-white">Static ID</span>.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
