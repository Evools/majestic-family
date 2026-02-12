'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CustomSelect } from '@/components/ui/custom-select';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

import { useSession } from 'next-auth/react';

export default function ReportPage() {
    const { data: session } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [contractType, setContractType] = useState('');
  
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsSubmitting(true);
      
      const formData = new FormData(e.currentTarget);
      const data = Object.fromEntries(formData.entries());

      try {
        const response = await fetch('/api/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          setSuccess(true);
          // Optional: Reset form or keep success state
        } else {
          console.error('Submission failed');
          // Handle error state if needed
        }
      } catch (error) {
        console.error('Error submitting report:', error);
      } finally {
        setIsSubmitting(false);
      }
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
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Тип контракта</label>
                        <CustomSelect 
                            options={[
                                { value: 'fishing_i', label: 'Рыбалка I уровня' },
                                { value: 'fishing_ii', label: 'Рыбалка II уровня' },
                                { value: 'fishing_iii', label: 'Рыбалка III уровня' },
                                { value: 'fishing_iv', label: 'Рыбалка IV уровня' },
                                { value: 'fishing_v', label: 'Рыбалка V уровня' },
                                { value: 'fishing_vi', label: 'Рыбалка VI уровня' },
                                { value: 'fishing_x', label: 'Рыбалка VII уровня' },
                                { value: 'fishing_x', label: 'Рыбалка VIII уровня' },
                                { value: 'fishing_x', label: 'Рыбалка IX уровня' },
                                { value: 'metallurgy', label: 'Металлургия' },
                                { value: 'boxes', label: 'Товар со склада' },
                                { value: 'atelier', label: 'Ателье' }
                            ]}
                            value={contractType}
                            onChange={setContractType}
                            placeholder="Выберите контракт"
                        />
                         {/* Hidden input to include select value in FormData */}
                         <input type="hidden" name="contractType" value={contractType} />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2 md:col-span-1 space-y-2">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Предмет</label>
                            <Input 
                                name="itemName" 
                                placeholder="Например: Кабель" 
                                className="bg-[#0a0a0a] border-[#1f1f1f] text-white placeholder:text-gray-600 focus-visible:ring-[#e81c5a]/50" 
                                required 
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1 space-y-2">
                             <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Количество</label>
                            <Input 
                                name="quantity" 
                                type="number" 
                                placeholder="0" 
                                min="1"
                                className="bg-[#0a0a0a] border-[#1f1f1f] text-white placeholder:text-gray-600 focus-visible:ring-[#e81c5a]/50" 
                                required 
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Доказательства</label>
                    <Input 
                        name="proof"
                        placeholder="Ссылка на Imgur / YouTube" 
                        className="bg-[#0a0a0a] border-[#1f1f1f] text-white placeholder:text-gray-600 focus-visible:ring-[#e81c5a]/50" 
                        required
                    />
                    <p className="text-[10px] text-gray-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Убедитесь, что ссылка доступна для просмотра.
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Комментарий</label>
                    <textarea 
                        name="comment"
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
