'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Send, Upload } from 'lucide-react';
import { useState } from 'react';

export function ReportForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      // Reset after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  return (
    <Card className="w-full max-w-xl mx-auto bg-black/60 border-white/10 backdrop-blur-xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#e81c5a]/20 rounded-full blur-[80px] pointer-events-none" />
        
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-3xl font-bold tracking-tight">
          <div className="p-2 rounded-lg bg-[#e81c5a]/10 text-[#e81c5a]">
            <Send className="w-6 h-6" />
          </div>
          Отчетность
        </CardTitle>
        <CardDescription className="text-base">
          Заполните форму для получения вознаграждения. Внимательно проверяйте ссылки.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {success ? (
          <div className="flex flex-col items-center justify-center p-12 animate-in zoom-in duration-300 border border-green-500/20 rounded-2xl bg-green-500/5">
             <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
               <Send className="w-10 h-10 text-green-500" />
             </div>
             <h3 className="text-2xl font-bold text-white mb-2">Отчет Принят</h3>
             <p className="text-[#a1a1aa] text-center">Ожидайте начисления средств на баланс.</p>
             <Button className="mt-8 bg-green-600 hover:bg-green-700 w-full" onClick={() => setSuccess(false)}>Отправить еще</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold text-[#737373] ml-1">
                Контракт
              </label>
              <div className="relative">
                <select 
                    className="w-full h-12 bg-black/40 border border-white/10 rounded-lg px-4 text-white focus:outline-none focus:border-[#e81c5a] transition-all appearance-none cursor-pointer hover:bg-white/5"
                    required
                >
                    <option value="" disabled selected>Выберите контракт...</option>
                    <option value="transport">Перевозка транспортных средств</option>
                    <option value="territory">Захват территории</option>
                    <option value="materials">Сбор материалов</option>
                    <option value="training">Проведение тренировки</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">▼</div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold text-[#737373] ml-1">
                Комментарий
              </label>
              <textarea 
                rows={4}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#e81c5a] transition-all resize-none placeholder:text-gray-700 hover:bg-white/5"
                placeholder="Опишите детали выполнения задания..."
              ></textarea>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold text-[#737373] ml-1">
                Доказательства
              </label>
              <div className="relative group">
                <Input 
                  type="url"
                  placeholder="https://imgur.com/..."
                  className="pl-12 h-12 bg-black/40 border-white/10 hover:bg-white/5 focus:border-[#e81c5a]"
                  required
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded bg-white/5 flex items-center justify-center text-gray-500 group-focus-within:text-[#e81c5a] transition-colors">
                    <Upload className="w-4 h-4" />
                </div>
              </div>
            </div>

            <Button 
                type="submit" 
                className="w-full text-sm h-12 shadow-[0_0_30px_rgba(232,28,90,0.3)] hover:shadow-[0_0_50px_rgba(232,28,90,0.5)] transition-all duration-300"
                disabled={isSubmitting}
            >
              {isSubmitting ? 'ОТПРАВКА...' : 'ПОДТВЕРДИТЬ ВЫПОЛНЕНИЕ'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
