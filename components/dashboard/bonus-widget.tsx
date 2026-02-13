import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DashboardSettings } from '@/types/dashboard';
import { ArrowRight, Coins, Flame, Zap } from 'lucide-react';

interface BonusWidgetProps {
    settings: DashboardSettings;
}

export function BonusWidget({ settings }: BonusWidgetProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Event / Bonus */}
            <Card className={`lg:col-span-2 relative overflow-hidden border border-[#1f1f1f] ${settings.bonusActive ? 'bg-gradient-to-r from-[#e81c5a] to-[#7f1d1d] border-0' : 'bg-[#0a0a0a]'}`}>
                {settings.bonusActive ? (
                    <>
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Flame className="w-64 h-64 text-white transform rotate-12" />
                        </div>
                        <CardContent className="p-8 relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/10">
                                    Активный бонус
                                </span>
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">{settings.bonusTitle || 'Специальное предложение'}</h2>
                            <p className="text-white/80 max-w-lg mb-8 text-lg">
                                {settings.bonusDescription || 'Следите за обновлениями!'}
                            </p>
                            <Button className="bg-white text-[#e81c5a] hover:bg-white/90 font-bold border-0">
                                Перейти к контрактам <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </CardContent>
                    </>
                ) : (
                    <CardContent className="p-8 flex flex-col items-center justify-center h-full text-center relative z-10 min-h-[300px]">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Flame className="w-64 h-64 text-white transform rotate-12" />
                        </div>
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/5">
                            <Flame className="w-8 h-8 text-gray-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Активных бонусов нет</h2>
                        <p className="text-gray-500 max-w-md">
                            На данный момент нет специальных заданий или бонусов. 
                            Выполняйте обычные контракты и следите за обновлениями!
                        </p>
                    </CardContent>
                )}
            </Card>

            {/* Family Bank Status */}
            <Card className="bg-[#0a0a0a] border border-[#1f1f1f] flex flex-col justify-center">
                <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-6 text-yellow-500">
                        <Coins className="w-8 h-8" />
                    </div>
                    <h3 className="text-gray-400 uppercase tracking-widest text-xs font-bold mb-2">Баланс Семьи</h3>
                    <div className="text-4xl font-mono font-bold text-white mb-4">${settings.familyBalance.toLocaleString()}</div>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                        <Zap className="w-4 h-4" />
                        <span>Обновлено</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
