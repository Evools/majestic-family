import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RecentReport } from '@/types/dashboard';
import { CheckCircle, Clock, Target } from 'lucide-react';

interface ActivityFeedProps {
    recentReports: RecentReport[];
}

export function ActivityFeed({ recentReports }: ActivityFeedProps) {
    return (
        <div className="grid grid-cols-1 gap-6">
            <Card className="bg-[#0a0a0a] border border-[#1f1f1f]">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white">Последняя активность</h3>
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-white">
                            Все события
                        </Button>
                    </div>
                    <div className="space-y-6">
                        {recentReports.length > 0 ? (
                            recentReports.map((report) => {
                                const userName = report.user.firstName || report.user.name || 'Unknown';
                                const statusColor =
                                    report.status === 'APPROVED' ? 'text-green-500 bg-green-500/10' :
                                        report.status === 'REJECTED' ? 'text-red-500 bg-red-500/10' :
                                            'text-yellow-500 bg-yellow-500/10';
                                const StatusIcon =
                                    report.status === 'APPROVED' ? CheckCircle :
                                        report.status === 'REJECTED' ? Target :
                                            Clock;

                                return (
                                    <div key={report.id} className="flex items-start gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${statusColor}`}>
                                            <StatusIcon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-300">
                                                <span className="font-bold text-white hover:text-[#e81c5a] cursor-pointer transition-colors">{userName}</span> отправил отчет <span className="font-medium text-white">{report.itemName}</span>
                                            </p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(report.createdAt).toLocaleDateString('ru-RU')}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-center text-gray-500 py-8">Нет активности</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
