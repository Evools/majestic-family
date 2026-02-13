'use client';

import { ContractHeader } from '@/components/report/contract-header';
import { ParticipantSelector } from '@/components/report/participant-selector';
import { ReportFormFields } from '@/components/report/report-form-fields';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Member, ReportFormState, UserContractWithContract } from '@/types/report';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// --- Main Page ---

export default function ReportPage() {
    const { data: session } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeContracts, setActiveContracts] = useState<UserContractWithContract[]>([]);
    const [loading, setLoading] = useState(true);
    const [reportForms, setReportForms] = useState<ReportFormState[]>([]);
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

    const updateForm = (index: number, field: keyof ReportFormState, value: ReportFormState[keyof ReportFormState]) => {
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
        for (const form of filledForms) {
          try {
            const response = await fetch('/api/report', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(form),
            });

            if (response.ok) {
              successfulSubmissions++;
            }
          } catch (error) {
            console.error('Error submitting report:', error);
          }
        }

        setSuccessCount(successfulSubmissions);
        await fetchActiveContracts();
        setTimeout(() => setSuccessCount(0), 4000);
      } finally {
        setIsSubmitting(false);
      }
    };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-2">
        <div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-1">Новый отчет</h1>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Заполните данные о выполненных контрактах</p>
        </div>
      </div>

      {loading ? (
        <Card className="bg-[#0a0a0a] border-[#1f1f1f] border-dashed">
          <CardContent className="p-12 text-center text-gray-500">
            Загрузка активных контрактов...
          </CardContent>
        </Card>
      ) : activeContracts.length === 0 ? (
        <Card className="bg-[#0a0a0a] border-white/10 border-dashed">
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500/40 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Нет активных контрактов</h3>
            <p className="text-sm text-gray-400 mb-6 uppercase tracking-widest">Сначала возьмите контракт на главной странице.</p>
            <Link href="/contracts">
              <Button className="bg-[#e81c5a] hover:bg-[#c21548] text-white text-xs font-black uppercase tracking-widest h-10 px-6 shadow-lg shadow-[#e81c5a]/20">
                Список контрактов
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {successCount > 0 && (
            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20 flex items-center gap-4 animate-in slide-in-from-top-2">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-black text-white uppercase tracking-tight">
                  {successCount} {successCount === 1 ? 'отчет' : 'отчета'} успешно отправлен{successCount > 1 ? 'о' : ''}!
                </p>
                <p className="text-xs font-bold text-green-500/60 uppercase tracking-widest mt-0.5">Средства будут зачислены после проверки.</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {activeContracts.map((uc, index) => {
              const form = reportForms[index];
              if (!form) return null;

              return (
                <Card key={uc.id} className="bg-[#0a0a0a] border-white/10 hover:border-white/20 transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                  <CardContent className="p-6">
                    <ContractHeader uc={uc} onRemove={() => removeForm(index)} />
                    
                    <ReportFormFields 
                      form={form} 
                      index={index} 
                      onUpdate={(field, value) => updateForm(index, field, value)} 
                    />

                    <ParticipantSelector 
                      selectedIds={form.participantIds}
                      members={members}
                      session={session}
                      onAdd={(val) => {
                        const updatedIds = [...form.participantIds, val];
                        updateForm(index, 'participantIds', updatedIds);
                      }}
                      onRemove={(pid) => {
                        const updatedIds = form.participantIds.filter(id => id !== pid);
                        updateForm(index, 'participantIds', updatedIds);
                      }}
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-4 pt-4">
            <div className="flex items-center gap-4">
                 <div className="p-4 border border-white/10 rounded-xl bg-[#0a0a0a]/50 max-w-[300px]">
                    <h4 className="font-black text-white text-[10px] uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <AlertCircle className="w-3 h-3 text-red-500" />
                        Важно
                    </h4>
                    <p className="text-[9px] font-bold text-gray-400 leading-relaxed uppercase tracking-widest">
                        Срок действия доказательств - 24 часа. На видео должно быть видно время.
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Link href="/contracts">
                  <Button variant="ghost" className="text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-white">Отмена</Button>
                </Link>
                <Button 
                  className="bg-[#e81c5a] hover:bg-[#c21548] text-white text-xs font-black uppercase tracking-widest h-12 px-8 shadow-lg shadow-[#e81c5a]/20" 
                  onClick={handleSubmitAll}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Отправка...' : `Отправить отчеты (${reportForms.filter(f => f.itemName && f.quantity && f.proof).length})`}
                </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
