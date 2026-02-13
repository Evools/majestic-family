'use client';

import { ParticipantSelector } from '@/components/report/participant-selector';
import { ReportFormFields } from '@/components/report/report-form-fields';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/notifications/notification-context';
import { Member, ReportFormState, UserContractWithContract } from '@/types/report';
import { AlertCircle, ChevronDown, Send } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// --- Main Page ---

export default function ReportPage() {
    const { data: session } = useSession();
    const { addToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeContracts, setActiveContracts] = useState<UserContractWithContract[]>([]);
    const [loading, setLoading] = useState(true);
    const [reportForms, setReportForms] = useState<ReportFormState[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    
    // Accordion State: store the ID of the currently expanded contract
    const [expandedIds, setExpandedIds] = useState<string[]>([]);

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
          const contracts = data.active || [];
          setActiveContracts(contracts);
          setReportForms(contracts.map((uc: UserContractWithContract) => ({
            userContractId: uc.id,
            itemName: '',
            quantity: '',
            proof: '',
            comment: '',
            participantIds: [],
          })) || []);

          // Auto-expand the first contract if exists
          if (contracts.length > 0) {
            setExpandedIds([contracts[0].id]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch active contracts:', error);
        addToast({
            type: 'error',
            title: 'Ошибка',
            message: 'Не удалось загрузить контракты',
        });
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
      const contractId = activeContracts[index]?.id;
      setReportForms(prev => prev.filter((_, i) => i !== index));
      setActiveContracts(prev => prev.filter((_, i) => i !== index));
      if (contractId) {
          setExpandedIds(prev => prev.filter(id => id !== contractId));
      }
    };

    const toggleExpand = (id: string) => {
        setExpandedIds(prev => 
            prev.includes(id) 
                ? prev.filter(i => i !== id) 
                : [id] // Close others when opening one (Accordion behavior), or [...prev, id] for multiple
        );
    };

    const handleSubmitSingle = async (index: number) => {
        const form = reportForms[index];
        if (!form || !form.itemName || !form.quantity || !form.proof) {
            addToast({
                type: 'warning',
                title: 'Внимание',
                message: 'Пожалуйста, заполните все обязательные поля (Предмет, Кол-во, Доказательства)',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (response.ok) {
                addToast({
                    type: 'success',
                    title: 'Отчет отправлен',
                    message: 'Ваш отчет успешно отправлен на проверку.',
                });
                removeForm(index);
            } else {
                addToast({
                    type: 'error',
                    title: 'Ошибка',
                    message: 'Произошла ошибка при отправке отчета.',
                });
            }
        } catch (error) {
            console.error('Error submitting report:', error);
            addToast({
                type: 'error',
                title: 'Ошибка сервера',
                message: 'Не удалось соединиться с сервером.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Check if form has minimum required data
    const isFormReady = (index: number) => {
        const form = reportForms[index];
        return form && form.itemName && form.quantity && form.proof;
    };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 mx-auto">
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
        <div className="space-y-4">
            {activeContracts.map((uc, index) => {
              const form = reportForms[index];
              if (!form) return null;
              const isExpanded = expandedIds.includes(uc.id);
              const ready = isFormReady(index);

              return (
                <div key={uc.id} className="group relative">
                    <Card className={`bg-[#0a0a0a] border-white/10 transition-all duration-300 overflow-hidden ${isExpanded ? 'shadow-[0_0_30px_rgba(0,0,0,0.3)] border-white/20' : 'hover:border-white/20'}`}>
                        {/* Header Area - Clickable to toggle */}
                        <div 
                            onClick={() => toggleExpand(uc.id)}
                            className="p-6 cursor-pointer flex items-start justify-between gap-4 select-none relative z-10 bg-[#0a0a0a]"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className={`font-bold text-lg tracking-tight transition-colors ${isExpanded ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                        {uc.contract.title}
                                    </h3>
                                    {ready && !isExpanded && (
                                        <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-500 text-[9px] font-black uppercase tracking-widest border border-green-500/30 animate-pulse">
                                            Готов к отправке
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-gray-500">
                                    <span className="text-blue-400">LVL {uc.contract.level}</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-700" />
                                    <span className="text-green-500/80">${uc.contract.reward.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-all duration-300 ${isExpanded ? 'bg-white text-black rotate-180' : 'bg-transparent text-gray-500 group-hover:border-white/30 group-hover:text-white'}`}>
                                <ChevronDown className="w-4 h-4" />
                            </div>
                        </div>

                        {/* Expandable Content with Grid Animation */}
                        <div 
                            className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                        >
                            <div className="overflow-hidden">
                                <div className="rounded-b-xl border-t border-white/5 bg-[#050505]/50">
                                    <CardContent className="p-6">
                                        <div className="mb-6 flex items-start p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl gap-3">
                                            <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold text-blue-200">Информация о контракте</p>
                                                <p className="text-[11px] text-blue-200/60 leading-relaxed">{uc.contract.description || "Нет описания"}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            <div>
                                                 <ReportFormFields 
                                                    form={form} 
                                                    index={index} 
                                                    onUpdate={(field, value) => updateForm(index, field, value)} 
                                                />
                                            </div>
                                            <div className="lg:border-l lg:border-white/10 lg:pl-8">
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
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                                            <Button 
                                                variant="ghost" 
                                                onClick={(e) => { e.stopPropagation(); removeForm(index); }}
                                                className="text-gray-500 hover:text-red-500 hover:bg-red-500/5 text-xs font-bold uppercase tracking-widest"
                                            >
                                                Отказаться
                                            </Button>
                                            <Button 
                                                className="bg-[#e81c5a] hover:bg-[#c21548] text-white text-xs font-black uppercase tracking-widest h-12 px-8 shadow-lg shadow-[#e81c5a]/20" 
                                                onClick={() => handleSubmitSingle(index)}
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? 'Отправка...' : 'Отправить отчет'} <Send className="w-4 h-4 ml-2" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
              );
            })}
          </div>
      )}
      <div className="flex items-center justify-center pt-8 pb-12">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            Всего активных контрактов: {activeContracts.length}
            </p>
      </div>
    </div>
  );
}
