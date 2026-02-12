'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Contract } from '@prisma/client';
import { AlertCircle, CheckCircle2, DollarSign, Star, Trash2 } from 'lucide-react';
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

type ReportForm = {
  userContractId: string;
  itemName: string;
  quantity: string;
  proof: string;
  comment: string;
  participantIds: string[];
};

type Member = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
};

export default function ReportPage() {
    const { data: session } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeContracts, setActiveContracts] = useState<UserContractWithContract[]>([]);
    const [loading, setLoading] = useState(true);
    const [reportForms, setReportForms] = useState<ReportForm[]>([]);
    const [successCount, setSuccessCount] = useState(0);
    const [members, setMembers] = useState<Member[]>([]);
  
    useEffect(() => {
      fetchActiveContracts();
      fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const res = await fetch('/api/members');
            if (res.ok) {
                setMembers(await res.json());
            }
        } catch (error) {
            console.error('Failed to fetch members:', error);
        }
    };

    const fetchActiveContracts = async () => {
      try {
        const res = await fetch('/api/user/contracts');
        if (res.ok) {
          const data = await res.json();
          setActiveContracts(data.active || []);
          // Initialize forms for all active contracts
          setReportForms(data.active?.map((uc: UserContractWithContract) => ({
            userContractId: uc.id,
            itemName: '',
            quantity: '',
            proof: '',
            comment: '',
            participantIds: [],
          })) || []);
        }
      } catch (error) {
        console.error('Failed to fetch active contracts:', error);
      } finally {
        setLoading(false);
      }
    };

    const updateForm = (index: number, field: keyof ReportForm, value: string) => {
      setReportForms(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value };
        return updated;
      });
    };

    const removeForm = (index: number) => {
      setReportForms(prev => prev.filter((_, i) => i !== index));
      setActiveContracts(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmitAll = async () => {
      // Filter out empty forms
      const filledForms = reportForms.filter(form => 
        form.itemName && form.quantity && form.proof
      );

      if (filledForms.length === 0) {
        alert('Заполните хотя бы один отчет');
        return;
      }

      setIsSubmitting(true);
      let successfulSubmissions = 0;

      try {
        // Submit each report
        for (const form of filledForms) {
          try {
            const response = await fetch('/api/report', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userContractId: form.userContractId,
                itemName: form.itemName,
                quantity: form.quantity,
                proof: form.proof,
                comment: form.comment,
                participantIds: form.participantIds,
              }),
            });

            if (response.ok) {
              successfulSubmissions++;
            }
          } catch (error) {
            console.error('Error submitting report:', error);
          }
        }

        setSuccessCount(successfulSubmissions);
        
        // Refresh and reset
        await fetchActiveContracts();
        
        // Auto-hide success after 4 seconds
        setTimeout(() => {
          setSuccessCount(0);
        }, 4000);
      } finally {
        setIsSubmitting(false);
      }
    };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div>
            <h1 className="text-3xl font-bold text-white">Новый отчет</h1>
            <p className="text-gray-400">Заполните данные о выполненных контрактах.</p>
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
        <>
          {/* Success Toast */}
          {successCount > 0 && (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-500">
                  {successCount} {successCount === 1 ? 'отчет' : 'отчета'} успешно отправлен{successCount > 1 ? 'о' : ''}!
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Средства будут зачислены после проверки модератором.</p>
              </div>
            </div>
          )}

          {/* Report Forms */}
          <div className="space-y-4">
            {activeContracts.map((uc, index) => {
              const form = reportForms[index];
              if (!form) return null;

              return (
                <Card key={uc.id} className="bg-[#0a0a0a] border-blue-500/20">
                  <CardContent className="p-6">
                    {/* Contract Header */}
                    <div className="flex items-start justify-between mb-4 pb-4 border-b border-white/5">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-white text-lg">{uc.contract.title}</h3>
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 text-xs font-bold border border-blue-500/20">
                            LVL {uc.contract.level}
                          </span>
                        </div>
                        {uc.contract.description && (
                          <p className="text-sm text-gray-400 mb-2">{uc.contract.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-green-500">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-bold">${uc.contract.reward.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="w-4 h-4" />
                            <span className="font-bold">+{uc.contract.reputation} XP</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={() => removeForm(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                      {/* Form Fields */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Предмет</label>
                          <Input 
                            placeholder="Например: Кабель" 
                            className="bg-[#0a0a0a] border-[#1f1f1f] text-white placeholder:text-gray-600 focus-visible:ring-blue-500/50" 
                            value={form.itemName}
                            onChange={(e) => updateForm(index, 'itemName', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Количество</label>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            min="1"
                            className="bg-[#0a0a0a] border-[#1f1f1f] text-white placeholder:text-gray-600 focus-visible:ring-blue-500/50" 
                            value={form.quantity}
                            onChange={(e) => updateForm(index, 'quantity', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Доказательства</label>
                        <Input 
                          placeholder="Ссылка на Imgur / YouTube" 
                          className="bg-[#0a0a0a] border-[#1f1f1f] text-white placeholder:text-gray-600 focus-visible:ring-blue-500/50" 
                          value={form.proof}
                          onChange={(e) => updateForm(index, 'proof', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Комментарий</label>
                        <textarea 
                          className="w-full min-h-[80px] bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 resize-y transition-all"
                          placeholder="Дополнительные детали..."
                          value={form.comment}
                          onChange={(e) => updateForm(index, 'comment', e.target.value)}
                        />
                      </div>

                      <div className="space-y-3 pt-2 border-t border-white/5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                           <Star className="w-3 h-3" />
                           Доп. участники
                        </label>
                        
                        <div className="flex flex-wrap gap-2 mb-2">
                            {/* Always show self */}
                            <div className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-500 font-bold uppercase tracking-wider">
                                {session?.user?.name} (Вы)
                            </div>
                            
                            {form.participantIds.map(pid => {
                                const member = members.find(m => m.id === pid);
                                return (
                                    <div key={pid} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-2">
                                        {member?.firstName || member?.name}
                                        <button 
                                            onClick={() => {
                                                const updatedIds = form.participantIds.filter(id => id !== pid);
                                                updateForm(index, 'participantIds', updatedIds as any);
                                            }}
                                            className="text-red-500 hover:text-red-400"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        <select 
                            className="w-full h-10 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg px-3 text-xs text-gray-400 focus:outline-none focus:border-blue-500/50"
                            onChange={(e) => {
                                if (!e.target.value) return;
                                if (e.target.value === (session?.user as any)?.id) return;
                                if (form.participantIds.includes(e.target.value)) return;
                                
                                const updatedIds = [...form.participantIds, e.target.value];
                                updateForm(index, 'participantIds', updatedIds as any);
                                e.target.value = '';
                            }}
                        >
                            <option value="">Добавить участника...</option>
                            {members
                                .filter(m => m.id !== (session?.user as any)?.id && !form.participantIds.includes(m.id))
                                .map(m => (
                                    <option key={m.id} value={m.id}>
                                        {m.firstName ? `${m.firstName} (${m.name})` : m.name}
                                    </option>
                                ))
                            }
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Link href="/contracts">
              <Button variant="ghost" className="text-gray-400 hover:text-white">Отмена</Button>
            </Link>
            <Button 
              className="bg-[#e81c5a] hover:bg-[#c21548] text-white shadow-lg shadow-[#e81c5a]/20" 
              onClick={handleSubmitAll}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Отправка...' : `Отправить все отчеты (${reportForms.filter(f => f.itemName && f.quantity && f.proof).length})`}
            </Button>
          </div>
        </>
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
