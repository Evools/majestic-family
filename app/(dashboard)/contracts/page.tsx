'use client';

import { ContractCard } from '@/components/contract-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Contract } from '@prisma/client';
import { AlertCircle, ArrowUpRight, Briefcase, Clock, History, Users } from 'lucide-react';
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
};

type GlobalContract = Contract & { 
  cycleCount: number; 
  alreadyParticipated: boolean;
  activeParticipants: { user: { id: string; name: string; firstName: string; lastName: string; image: string | null } }[];
};

export default function ContractsPage() {
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight uppercase">Контракты</h1>
          <p className="text-gray-500 mt-1 font-normal tracking-wide">Выберите задание и получите вознаграждение</p>
        </div>
      </div>

      {/* Active Contracts Section */}
      {activeContracts.length > 0 && (
        <div className="space-y-6">
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
                <Card key={uc.id} className="group relative overflow-hidden bg-[#0a0a0a] border-white/5 hover:border-green-500/20 transition-all duration-500 shadow-2xl">
                  {/* Glowing background effect */}
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-500/5 blur-[80px] group-hover:bg-green-500/10 transition-colors duration-500" />
                  
                  {/* Status Bar */}
                  <div className={`absolute top-0 left-0 w-full h-1 ${hasReport ? 'bg-blue-500' : 'bg-green-500'}`} />
                  
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest ${
                          hasReport 
                            ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' 
                            : 'bg-green-500/10 border-green-500/20 text-green-500'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${hasReport ? 'bg-blue-500' : 'bg-green-500 animate-pulse'}`} />
                          {hasReport ? 'Отчет на проверке' : 'Миссия Активна'}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-gray-500 bg-white/5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(uc.startedAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div className="grow">
                        <ContractCard contract={uc.contract} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 pt-6 mt-2 border-t border-white/5">
                      <Link href="/report" className="contents">
                        <Button 
                          className="bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-bold uppercase tracking-widest h-11 group/btn transition-all duration-300"
                        >
                          <span className="flex-1 text-center">Сдать отчет</span>
                          <ArrowUpRight className="w-4 h-4 ml-2 text-gray-500 group-hover/btn:text-white group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-all" />
                        </Button>
                      </Link>
                      
                      <Button
                        variant="ghost"
                        className="h-11 text-xs font-bold uppercase tracking-widest text-red-500/60 hover:text-red-500 hover:bg-red-500/5 border border-transparent hover:border-red-500/10"
                        onClick={() => setConfirmCancelId(uc.id)}
                        disabled={isCancelling}
                      >
                        {isCancelling ? '...' : 'Отмена'}
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
      <div className="space-y-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                <Card key={contract.id} className={`group relative h-full bg-[#0a0a0a] border border-[#1f1f1f] hover:border-[#e81c5a]/20 transition-all duration-300 flex flex-col ${isDimmed ? 'opacity-80' : ''}`}>
                  {/* Status Overlay Badges */}
                  <div className="absolute top-4 right-4 z-10 flex flex-col gap-1 items-end pointer-events-none">
                     {isActive && (
                         <span className="px-2 py-1 bg-green-500/20 text-green-500 text-[10px] font-bold uppercase tracking-widest rounded border border-green-500/20 shadow-lg backdrop-blur-sm">
                             В работе
                         </span>
                     )}
                     {alreadyParticipated && !isActive && (
                         <span className="px-2 py-1 bg-blue-500/20 text-blue-500 text-[10px] font-bold uppercase tracking-widest rounded border border-blue-500/20 shadow-lg backdrop-blur-sm">
                             Выполнено
                         </span>
                     )}
                     {isFull && !isActive && !alreadyParticipated && (
                         <span className="px-2 py-1 bg-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest rounded border border-red-500/20 shadow-lg backdrop-blur-sm">
                             Мест нет
                         </span>
                     )}
                  </div>

                  <CardContent className="p-6 flex flex-col h-full z-0 relative">
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
                       
                       {!contract.isFlexible ? (
                         <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 ${isFull ? 'bg-[#e81c5a]' : 'bg-gray-600'}`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                         </div>
                       ) : (
                         <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500/50 w-full animate-pulse" />
                         </div>
                       )}

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
                                 <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)] ml-1" />
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
                        className={`w-full h-12 text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                          isActive || cooldown || isFull || alreadyParticipated
                            ? 'bg-white/5 text-gray-500 border border-white/5 hover:bg-white/10'
                            : 'bg-[#e81c5a] hover:bg-[#c21548] text-white shadow-lg shadow-[#e81c5a]/20 hover:shadow-[#e81c5a]/40'
                        }`}
                        onClick={() => handleTakeContract(contract.id)}
                        disabled={isActive || !!cooldown || isTaking || activeContracts.length >= maxActiveContracts || isFull || alreadyParticipated}
                      >
                        {isTaking ? (
                          <div className="flex items-center gap-2">
                             <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                             Обработка...
                          </div>
                        ) : isActive ? (
                          'Контракт активен'
                        ) : cooldown ? (
                          <div className="flex items-center gap-2 text-orange-400">
                            <Clock className="w-4 h-4" />
                            <span>{cooldown.hours}ч {cooldown.minutes}м</span>
                          </div>
                        ) : isFull ? (
                          'Группа набрана'
                        ) : alreadyParticipated ? (
                          'Завершено'
                        ) : activeContracts.length >= maxActiveContracts ? (
                          `Лимит активных (${maxActiveContracts})`
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

      {/* History Section */}
      {completedContracts.length > 0 && (
        <div className="space-y-6 pt-10 border-t border-white/5">
          <h2 className="text-sm font-bold text-gray-600 tracking-widest uppercase opacity-50">История выполненных</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {completedContracts.map((uc) => (
              <Card key={uc.id} className="bg-transparent border-white/5 grayscale opacity-30 hover:opacity-100 transition-opacity">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-green-500/50">Завершено</span>
                    <span className="text-[9px] font-medium text-gray-500">
                      {new Date(uc.startedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <ContractCard contract={uc.contract} />
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
