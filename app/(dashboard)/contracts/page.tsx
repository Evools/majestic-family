'use client';

import { ContractCard } from '@/components/contract-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Contract } from '@prisma/client';
import { AlertCircle, ArrowUpRight, Briefcase, CheckCircle2, Clock, History, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';


type UserContractWithContract = {
  id: string;
  contractId: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  contract: Contract & { maxSlots: number; cycleCount: number };
  reports: { status: string; id: string }[];
  totalQuantity: number;
  targetGoal: number;
};


type GlobalContract = Contract & { 
  cycleCount: number; 
  totalQuantity: number;
  alreadyParticipated: boolean;
  activeParticipants: any[];
  targetGoal: number;
};

export default function ContractsPage() {
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'history'>('available');
  const [contracts, setContracts] = useState<GlobalContract[]>([]);
  const [activeContracts, setActiveContracts] = useState<UserContractWithContract[]>([]);
  const [completedContracts, setCompletedContracts] = useState<UserContractWithContract[]>([]);
  const [cooldownHours, setCooldownHours] = useState<number>(24);
  const [maxActiveContracts, setMaxActiveContracts] = useState<number>(10);
  const [loading, setLoading] = useState(true);
  const [takingContract, setTakingContract] = useState<string | null>(null);
  const [cancellingContract, setCancellingContract] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const [errorModal, setErrorModal] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userContractsRes = await fetch('/api/user/contracts');
      if (userContractsRes.ok) {
        const data = await userContractsRes.json();
        setActiveContracts(data.active || []);
        setCompletedContracts(data.completed || []);
        setCooldownHours(data.cooldownHours || 24);
        setMaxActiveContracts(data.maxActiveContracts || 10);
        setContracts(data.availableContracts || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeContract = async (contractId: string) => {
    setTakingContract(contractId);
    try {
      const res = await fetch('/api/user/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId }),
      });

      if (res.ok) {
        // Refresh data
        await fetchData();
      } else {
        const error = await res.json();
        setErrorModal({
          title: error.error || 'Ошибка',
          message: error.message || 'Не удалось взять контракт'
        });
      }
    } catch (error) {
      console.error('Error taking contract:', error);
      setErrorModal({
        title: 'Ошибка',
        message: 'Произошла непредвиденная ошибка при попытке взять контракт.'
      });
    } finally {
      setTakingContract(null);
    }
  };

  const handleCancelContract = async (userContractId: string) => {
    setCancellingContract(userContractId);
    setCancelError(null);
    try {
      const res = await fetch(`/api/user/contracts/${userContractId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Refresh data
        await fetchData();
        setConfirmCancelId(null);
        setCancelError(null);
      } else {
        const error = await res.json();
        setCancelError(error.error || 'Failed to cancel contract');
      }
    } catch (error) {
      console.error('Error cancelling contract:', error);
      setCancelError('Failed to cancel contract');
    } finally {
      setCancellingContract(null);
    }
  };



  const isContractActive = (contractId: string) => {
    return activeContracts.some(uc => uc.contractId === contractId);
  };

  const getCooldownRemaining = (cooldownUntil: string | null) => {
    if (!cooldownUntil) return null;

    const now = new Date();
    const cooldownDate = new Date(cooldownUntil);
    const remainingMs = cooldownDate.getTime() - now.getTime();

    if (remainingMs > 0) {
      const hours = Math.floor(remainingMs / (60 * 60 * 1000));
      const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
      return { hours, minutes };
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Контракты</h1>
            <p className="text-gray-500 mt-1 font-normal tracking-wide">Выберите задание и получите вознаграждение</p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-1 bg-[#0a0a0a] border border-[#1f1f1f] p-1 rounded-lg w-full max-w-fit">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'available' ? 'bg-[#e81c5a] text-white shadow' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Доступные ({contracts.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'active' ? 'bg-green-500 text-white shadow' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            В работе ({activeContracts.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'history' ? 'bg-white/10 text-white shadow' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            История ({completedContracts.length})
          </button>
        </div>
      </div>

      {/* Active Contracts Section */}
      {activeTab === 'active' && activeContracts.length === 0 && (
        <Card className="bg-[#0a0a0a] border border-[#1f1f1f] border-dashed">
          <CardContent className="p-12 text-center flex flex-col items-center justify-center">
            <Briefcase className="w-12 h-12 text-gray-600 mb-4" />
            <p className="text-gray-500 font-medium pb-2">У вас нет активных контрактов</p>
            <Button onClick={() => setActiveTab('available')} variant="link" className="text-[#e81c5a]">
              Взять контракт
            </Button>
          </CardContent>
        </Card>
      )}
      {activeTab === 'active' && activeContracts.length > 0 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Ваши задания</h2>
                <p className="text-gray-500 text-xs">Активные контракты в работе</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-400 uppercase tracking-widest">
              {activeContracts.length} / {maxActiveContracts} активно
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeContracts.map((uc) => {
              const isCancelling = cancellingContract === uc.id;
              const hasReport = uc.reports.length > 0;
              
              return (
                <Card key={uc.id} className="group relative h-full bg-[#0a0a0a] border border-[#1f1f1f] hover:border-green-500/30 transition-all duration-300 flex flex-col overflow-hidden rounded-xl">
                  <CardContent className="p-5 flex flex-col h-full z-10 relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-2">
                        <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-widest ${
                          hasReport 
                            ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' 
                            : 'bg-green-500/10 border-green-500/20 text-green-500'
                        }`}>
                          {hasReport ? 'Отчет на проверке' : 'Миссия Активна'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-bold uppercase tracking-widest leading-none">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(uc.startedAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    <div className="mb-6 space-y-3">
                       {/* Progress based on Target Goal */}
                       <div className="space-y-2">
                           <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest leading-none">
                               <span className="text-gray-500">Прогресс семьи</span>
                               <span className={cn(
                                   "font-black tabular-nums",
                                   (uc.totalQuantity / (uc.targetGoal || 1) * 100) >= 100 ? "text-green-500" : "text-[#e81c5a]"
                               )}>
                                   {Math.round((uc.totalQuantity / (uc.targetGoal || 1)) * 100)}%
                               </span>
                           </div>
                           <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                               <div 
                                   className={cn(
                                       "h-full transition-all duration-1000",
                                       (uc.totalQuantity / (uc.targetGoal || 1) * 100) >= 100 ? "bg-green-500" : "bg-[#e81c5a]"
                                   )}
                                   style={{ width: `${Math.min((uc.totalQuantity / (uc.targetGoal || 1)) * 100, 100)}%` }}
                               />
                           </div>
                           <div className="flex justify-between items-center text-[9px] font-bold text-gray-500 uppercase tracking-tighter">
                               <span>Сдано {uc.totalQuantity} шт.</span>
                               <span>Цель: {uc.targetGoal}</span>
                           </div>
                       </div>
                    </div>

                    <div className="grow">
                        <ContractCard contract={uc.contract} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 pt-6 mt-4 border-t border-white/5">
                      <Link href="/report" className="contents">
                        <Button 
                          className="bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-bold uppercase tracking-widest h-10 group/btn transition-all duration-300"
                        >
                          <span className="flex-1 text-center">Сдать отчет</span>
                          <ArrowUpRight className="w-3.5 h-3.5 ml-1.5 text-gray-500 group-hover/btn:text-white group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-all text-xs" />
                        </Button>
                      </Link>
                      
                      <Button
                        variant="ghost"
                        className="h-10 text-[10px] font-bold uppercase tracking-widest text-red-500/60 hover:text-red-500 hover:bg-red-500/5 border border-transparent hover:border-red-500/10"
                        onClick={() => setConfirmCancelId(uc.id)}
                        disabled={cancellingContract === uc.id}
                      >
                        {cancellingContract === uc.id ? '...' : 'Отмена'}
                      </Button>
                    </div>

                  </CardContent>
                </Card>


              );
            })}
          </div>
        </div>
      )}

      {/* Available Contracts Section */}
      {activeTab === 'available' && (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e81c5a]/10 flex items-center justify-center">
              <History className="w-5 h-5 text-[#e81c5a]" />
            </div>
            <div>
                 <h2 className="text-2xl font-bold text-white tracking-tight">Доступные задания</h2>
                 <p className="text-gray-500 text-xs">Выберите контракт для выполнения</p>
            </div>
        </div>

        {contracts.length === 0 ? (
          <Card className="bg-[#0a0a0a] border border-[#1f1f1f] border-dashed">
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 font-medium">В данный момент предложений нет</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contracts.map((contract) => {
              const isActive = isContractActive(contract.id);
              const cooldown = getCooldownRemaining(contract.cooldownUntil as any);
              const isTaking = takingContract === contract.id;
              const isFull = contract.cycleCount >= contract.maxSlots;
              const alreadyParticipated = contract.alreadyParticipated;
              const progress = (contract.cycleCount / contract.maxSlots) * 100;
              
              // Only dim strictly if absolutely not interactive, but keep readable
              const isDimmed = isActive || (cooldown && !isActive);

              return (
                <Card key={contract.id} className={`group relative h-full bg-[#0a0a0a] border border-[#1f1f1f] hover:border-[#e81c5a]/30 transition-all duration-300 flex flex-col overflow-hidden rounded-xl ${isDimmed ? 'opacity-80' : ''}`}>
                  <CardContent className="p-5 flex flex-col h-full z-10 relative">
                    {/* Status Badges - Repositioned inside content for minimalist look */}
                    {(isActive || alreadyParticipated || isFull) && (
                      <div className="flex gap-2 mb-4">
                        {isActive && (
                          <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[9px] font-bold uppercase tracking-widest rounded border border-green-500/20">
                            В работе
                          </span>
                        )}
                        {alreadyParticipated && !isActive && (
                          <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[9px] font-bold uppercase tracking-widest rounded border border-blue-500/20">
                            Выполнено
                          </span>
                        )}
                        {isFull && !isActive && !alreadyParticipated && (
                          <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[9px] font-bold uppercase tracking-widest rounded border border-red-500/20">
                            Мест нет
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mb-6 space-y-3">
                       <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest leading-none">
                          <div className="flex items-center gap-1.5 text-gray-400">
                            <Users className="w-3.5 h-3.5" />
                            <span>{contract.isFlexible ? 'Без лимита' : 'Участники'}</span>
                          </div>
                          <span className={!contract.isFlexible && isFull ? 'text-[#e81c5a]' : 'text-gray-400'}>
                            {contract.isFlexible ? contract.cycleCount : `${contract.cycleCount} / ${contract.maxSlots}`}
                          </span>
                       </div>

                       {contract.totalQuantity > 0 && (
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest leading-none pt-1">
                            <div className="flex items-center gap-1.5 text-gray-400">
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              <span>Сдано всего</span>
                            </div>
                            <span className="text-blue-500">
                              {contract.totalQuantity} шт.
                            </span>
                        </div>
                       )}
                       
                       {/* Progress based on Target Goal */}
                       <div className="space-y-2">
                           <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest leading-none">
                               <span className="text-gray-500">Прогресс семьи</span>
                               <span className={cn(
                                   "font-black tabular-nums",
                                   (contract.totalQuantity / (contract.targetGoal || 1) * 100) >= 100 ? "text-green-500" : "text-[#e81c5a]"
                               )}>
                                   {Math.round((contract.totalQuantity / (contract.targetGoal || 1)) * 100)}%
                               </span>
                           </div>
                           <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                               <div 
                                   className={cn(
                                       "h-full transition-all duration-1000",
                                       (contract.totalQuantity / (contract.targetGoal || 1) * 100) >= 100 ? "bg-green-500" : "bg-[#e81c5a]"
                                   )}
                                   style={{ width: `${Math.min((contract.totalQuantity / (contract.targetGoal || 1)) * 100, 100)}%` }}
                               />
                           </div>
                           <div className="flex justify-between items-center text-[9px] font-bold text-gray-500 uppercase tracking-tighter">
                               <span>0</span>
                               <span>Цель: {contract.targetGoal}</span>
                           </div>
                       </div>


                       {/* Active Participants Avatars/Names */}
                       {contract.activeParticipants && contract.activeParticipants.length > 0 && (
                         <div className="flex flex-wrap gap-1.5 mt-2 min-h-[28px]">
                           {contract.activeParticipants.map((p) => (
                             <div 
                               key={p.user.id} 
                               className="pl-1 pr-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[9px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5 hover:border-[#e81c5a]/30 transition-colors"
                               title={p.user.firstName || p.user.name}
                             >
                               {p.user.image ? (
                                 <img 
                                   src={p.user.image} 
                                   alt="" 
                                   className="w-4 h-4 rounded-full object-cover border border-white/10"
                                 />
                               ) : (
                                 <div className="w-2 h-2 rounded-full bg-green-500 ml-1" />
                               )}
                               <span className="max-w-[70px] truncate">
                                 {p.user.firstName || p.user.name}
                               </span>
                             </div>
                           ))}
                         </div>
                       )}
                    </div>

                    <div className="grow">
                        <ContractCard contract={contract} />
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/5">
                      <Button
                        className={`w-full h-11 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                          isActive || cooldown || isFull || alreadyParticipated
                            ? 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed'
                            : 'bg-[#e81c5a] hover:bg-[#c21548] text-white'
                        }`}
                        onClick={() => handleTakeContract(contract.id)}
                        disabled={isActive || !!cooldown || isTaking || activeContracts.length >= maxActiveContracts || isFull || alreadyParticipated}
                      >
                        {isTaking ? (
                          <div className="flex items-center gap-2">
                             <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                             Обработка
                          </div>
                        ) : isActive ? (
                          'В работе'
                        ) : cooldown ? (
                          <div className="flex items-center gap-2 text-orange-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{cooldown.hours}ч {cooldown.minutes}м</span>
                          </div>
                        ) : isFull ? (
                          'Мест нет'
                        ) : alreadyParticipated ? (
                          'Выполнено'
                        ) : activeContracts.length >= maxActiveContracts ? (
                          `Лимит (${maxActiveContracts})`
                        ) : (
                          'Подписать контракт'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      )}

      {/* History Section */}
      {activeTab === 'history' && completedContracts.length === 0 && (
        <Card className="bg-[#0a0a0a] border border-[#1f1f1f] border-dashed">
          <CardContent className="p-12 text-center flex flex-col items-center justify-center">
            <History className="w-12 h-12 text-gray-600 mb-4" />
            <p className="text-gray-500 font-medium">История контрактов пуста</p>
          </CardContent>
        </Card>
      )}
      {activeTab === 'history' && completedContracts.length > 0 && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <h2 className="text-sm font-black text-white/40 tracking-[0.2em] uppercase">Архив выполненных задач</h2>
            </div>
            <div className="h-px flex-1 bg-white/5 mx-6 hidden md:block" />
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
                Всего {completedContracts.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedContracts.map((uc) => (
              <Card key={uc.id} className="group relative h-full bg-[#0a0a0a] border border-[#1f1f1f] hover:border-blue-500/30 transition-all duration-300 flex flex-col overflow-hidden rounded-xl">
                <CardContent className="p-5 flex flex-col h-full z-10 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 rounded border border-blue-500/20 bg-blue-500/10 text-blue-500 text-[9px] font-bold uppercase tracking-widest">
                        Выполнено
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-bold uppercase tracking-widest leading-none">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(uc.startedAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
                    </div>
                  </div>

                  <div className="mb-6 space-y-3">
                     {/* Progress based on Target Goal */}
                     <div className="space-y-2">
                         <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest leading-none">
                             <span className="text-gray-500">Прогресс семьи</span>
                             <span className="font-black tabular-nums text-green-500">
                                 {Math.round((uc.totalQuantity / (uc.targetGoal || 1)) * 100)}%
                             </span>
                         </div>
                         <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                             <div 
                                 className="h-full transition-all duration-1000 bg-green-500"
                                 style={{ width: `${Math.min((uc.totalQuantity / (uc.targetGoal || 1)) * 100, 100)}%` }}
                             />
                         </div>
                         <div className="flex justify-between items-center text-[9px] font-bold text-gray-500 uppercase tracking-tighter">
                             <span>Итого {uc.totalQuantity} шт.</span>
                             <span>Цель: {uc.targetGoal}</span>
                         </div>
                     </div>
                  </div>

                  <div className="grow">
                      <ContractCard contract={uc.contract} />
                  </div>
                  
                  <div className="pt-6 mt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                        <History className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
                        Архив
                    </span>
                  </div>

                </CardContent>
              </Card>
            ))}
          </div>

        </div>
      )}

      {/* Confirmation Modal */}
      {confirmCancelId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full bg-[#0a0a0a] border border-red-500/10 shadow-2xl overflow-hidden">
            <div className="h-0.5 w-full bg-red-500/50" />
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-14 h-14 rounded-xl bg-red-500/5 border border-red-500/10 flex items-center justify-center mb-4 text-red-500">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-2">Расторгнуть договор?</h3>
                <p className="text-gray-500 text-sm font-normal px-4">
                  Вы уверены? Весь текущий прогресс по этому контракту будет аннулирован.
                </p>
              </div>

              {cancelError && (
                <div className="mb-6 p-4 rounded-lg bg-red-500/5 border border-red-500/10 flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-[10px] text-red-500/80 font-bold uppercase tracking-wider">{cancelError}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="ghost"
                  className="h-10 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white"
                  onClick={() => {
                    setConfirmCancelId(null);
                    setCancelError(null);
                  }}
                >
                  Отмена
                </Button>
                <Button
                  className="h-10 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest"
                  onClick={() => handleCancelContract(confirmCancelId)}
                  disabled={cancellingContract === confirmCancelId}
                >
                  {cancellingContract === confirmCancelId ? '...' : 'Расторгнуть'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Error Modal */}
      {errorModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-60 p-4 animate-in fade-in duration-300">
          <Card className="max-w-md w-full bg-[#0a0a0a] border border-[#1f1f1f] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="h-1 w-full bg-[#e81c5a]/50" />
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-[#e81c5a]/5 border border-[#e81c5a]/10 flex items-center justify-center mb-4 text-[#e81c5a]">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-3">
                  {errorModal.title === 'Category limit reached' ? 'Лимит категории' : errorModal.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {errorModal.message}
                </p>
              </div>

              <Button
                className="w-full h-11 bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white transition-all"
                onClick={() => setErrorModal(null)}
              >
                Понятно
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
