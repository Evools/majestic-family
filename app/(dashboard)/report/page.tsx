'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CustomSelect } from '@/components/ui/custom-select';
import { Input } from '@/components/ui/input';
import { Contract } from '@prisma/client';
import { AlertCircle, CheckCircle2, DollarSign, Star } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { useSession } from 'next-auth/react';

type UserContractWithContract = {
  id: string;
  contractId: string;
  status: string;
  startedAt: string;
  contract: Contract;
};

export default function ReportPage() {
    const { data: session } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [activeContracts, setActiveContracts] = useState<UserContractWithContract[]>([]);
    const [selectedContractId, setSelectedContractId] = useState('');
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      fetchActiveContracts();
    }, []);

    const fetchActiveContracts = async () => {
      try {
        const res = await fetch('/api/user/contracts');
        if (res.ok) {
          const data = await res.json();
          setActiveContracts(data.active || []);
          // Auto-select if only one active contract
          if (data.active?.length === 1) {
            setSelectedContractId(data.active[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch active contracts:', error);
      } finally {
        setLoading(false);
      }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsSubmitting(true);
      
      const formData = new FormData(e.currentTarget);
      const data = {
        userContractId: selectedContractId,
        itemName: formData.get('itemName'),
        quantity: formData.get('quantity'),
        proof: formData.get('proof'),
        comment: formData.get('comment'),
      };

      try {
        const response = await fetch('/api/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          setSuccess(true);
          // Reset form
          e.currentTarget.reset();
          setSelectedContractId('');
          // Refresh active contracts
          await fetchActiveContracts();
        } else {
          const error = await response.json();
          alert(error.error || 'Submission failed');
        }
      } catch (error) {
        console.error('Error submitting report:', error);
        alert('Error submitting report');
      } finally {
        setIsSubmitting(false);
      }
    };

    const selectedContract = activeContracts.find(uc => uc.id === selectedContractId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div>
            <h1 className="text-3xl font-bold text-white">Новый отчет</h1>
            <p className="text-gray-400">Заполните данные о выполненном контракте.</p>
        </div>
      </div>

      {loading ? (
        <Card className="bg-[#0a0a0a] border border-[#1f1f1f]">
          <CardContent className="p-8 text-center text-gray-400">
            Загрузка...
          </CardContent>
        </Card>
      ) : activeContracts.length === 0 ? (
        <Card className="bg-[#0a0a0a] border border-[#1f1f1f]">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Нет активных контрактов</h3>
            <p className="text-gray-400 mb-4">Сначала возьмите контракт на странице Контракты</p>
            <Link href="/contracts">
              <Button className="bg-[#e81c5a] hover:bg-[#c21548]">
                Перейти к контрактам
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          {success ? (
              <div className="p-12 text-center flex flex-col items-center">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                  <h3 className="text-xl font-bold text-white">Отчет отправлен успешно</h3>
                  <p className="text-gray-400 mt-2 mb-6">Средства будут зачислены после проверки модератором.</p>
                  <div className="flex gap-3">
                    <Button onClick={() => {
                      setSuccess(false);
                      // Auto-select if only one active contract remains
                      if (activeContracts.length === 1) {
                        setSelectedContractId(activeContracts[0].id);
                      }
                    }}>
                      {activeContracts.length > 0 ? 'Отправить еще один' : 'Закрыть'}
                    </Button>
                    <Link href="/contracts">
                      <Button variant="outline">К контрактам</Button>
                    </Link>
                  </div>
              </div>
          ) : (
              <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Contract Selection */}
                  <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Выберите контракт</label>
                      <CustomSelect 
                          options={activeContracts.map(uc => ({
                            value: uc.id,
                            label: uc.contract.title,
                          }))}
                          value={selectedContractId}
                          onChange={setSelectedContractId}
                          placeholder="Выберите активный контракт"
                      />
                  </div>

                  {/* Contract Details */}
                  {selectedContract && (
                    <Card className="bg-blue-500/5 border-blue-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-bold text-white mb-1">{selectedContract.contract.title}</h4>
                            {selectedContract.contract.description && (
                              <p className="text-sm text-gray-400 mb-2">{selectedContract.contract.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1 text-green-500">
                                <DollarSign className="w-4 h-4" />
                                <span className="font-bold">${selectedContract.contract.reward.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-1 text-yellow-500">
                                <Star className="w-4 h-4" />
                                <span className="font-bold">+{selectedContract.contract.reputation} XP</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="space-y-6">
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
                      <Link href="/contracts">
                        <Button type="button" variant="ghost" className="text-gray-400 hover:text-white">Отмена</Button>
                      </Link>
                      <Button 
                        type="submit" 
                        className="bg-[#e81c5a] hover:bg-[#c21548] text-white shadow-lg shadow-[#e81c5a]/20" 
                        disabled={isSubmitting || !selectedContractId}
                      >
                          {isSubmitting ? 'Отправка...' : 'Отправить отчет'}
                      </Button>
                  </div>
              </form>
              </CardContent>
          )}
        </Card>
      )}
      
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
