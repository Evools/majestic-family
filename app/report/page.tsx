'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CustomSelect } from '@/components/ui/custom-select';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function ReportPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [contractType, setContractType] = useState('');
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      
      setTimeout(() => {
        setIsSubmitting(false);
        setSuccess(true);
      }, 1500);
    };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div>
            <h1 className="text-3xl font-bold text-white">Новый отчет</h1>
            <p className="text-gray-400">Заполните данные о выполненном контракте.</p>
        </div>
      </div>

      <Card>
        {success ? (
            <div className="p-12 text-center flex flex-col items-center">
                <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-xl font-bold text-white">Отчет отправлен успешно</h3>
                <p className="text-gray-400 mt-2 mb-6">Средства будут зачислены после проверки модератором.</p>
                <Button onClick={() => setSuccess(false)}>Отправить еще один</Button>
            </div>
        ) : (
            <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2 md:col-span-1 space-y-2">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Тип контракта</label>
                        <CustomSelect 
                            options={[
                                { value: 'delivery', label: 'Дальнобойщик' },
                                { value: 'car_theft', label: 'Угон транспорта' },
                                { value: 'territory', label: 'Захват территории' },
                                { value: 'resources', label: 'Сбор ресурсов' }
                            ]}
                            value={contractType}
                            onChange={setContractType}
                            placeholder="Выберите контракт"
                        />
                    </div>
                    <div className="col-span-2 md:col-span-1 space-y-2">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Сумма вознаграждения</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                            <Input placeholder="50,000" className="pl-6 bg-[#0a0a0a] border-[#1f1f1f] text-white placeholder:text-gray-600 focus-visible:ring-[#e81c5a]/50" />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Доказательства</label>
                    <Input placeholder="Ссылка на Imgur / YouTube" className="bg-[#0a0a0a] border-[#1f1f1f] text-white placeholder:text-gray-600 focus-visible:ring-[#e81c5a]/50" />
                    <p className="text-[10px] text-gray-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Убедитесь, что ссылка доступна для просмотра.
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Комментарий</label>
                    <textarea 
                        className="w-full min-h-[120px] bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#e81c5a] focus:ring-1 focus:ring-[#e81c5a]/50 resize-y transition-all"
                        placeholder="Дополнительные детали..."
                    />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-white/5">
                    <Button type="button" variant="ghost" className="text-gray-400 hover:text-white">Отмена</Button>
                    <Button type="submit" className="bg-[#e81c5a] hover:bg-[#c21548] text-white shadow-lg shadow-[#e81c5a]/20" disabled={isSubmitting}>
                        {isSubmitting ? 'Отправка...' : 'Отправить отчет'}
                    </Button>
                </div>
            </form>
            </CardContent>
        )}
      </Card>
      
      {/* Help Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border border-[#1f1f1f] rounded-xl bg-[#0a0a0a]/50">
            <h4 className="font-bold text-white text-sm mb-1">Правила подачи</h4>
            <p className="text-xs text-gray-500">
                1. Скриншоты должны быть полными.<br/>
                2. На видео должно быть видно время.<br/>
                3. Срок действия доказательств - 24 часа.
            </p>
        </div>
        <div className="p-4 border border-[#1f1f1f] rounded-xl bg-[#0a0a0a]/50">
            <h4 className="font-bold text-white text-sm mb-1">Нужна помощь?</h4>
            <p className="text-xs text-gray-500">
                Если возникли проблемы с формой, обратитесь к заместителю лидера в Discord.
            </p>
        </div>
      </div>
    </div>
  );
}
