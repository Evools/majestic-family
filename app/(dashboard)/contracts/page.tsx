'use client';

import { ContractCard } from '@/components/contract-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Contract } from '@prisma/client';
import { AlertCircle, Briefcase, Check, Clock, History, Users, X } from 'lucide-react';
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

type GlobalContract = Contract & { cycleCount: number };

export default function ContractsPage() {
  const [contracts, setContracts] = useState<GlobalContract[]>([]);
  const [activeContracts, setActiveContracts] = useState<UserContractWithContract[]>([]);
  const [completedContracts, setCompletedContracts] = useState<UserContractWithContract[]>([]);
  const [cooldownHours, setCooldownHours] = useState<number>(24);
  const [loading, setLoading] = useState(true);
  const [takingContract, setTakingContract] = useState<string | null>(null);
  const [cancellingContract, setCancellingContract] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

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
        alert(error.error || 'Failed to take contract');
      }
    } catch (error) {
      console.error('Error taking contract:', error);
      alert('Failed to take contract');
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

  const getCooldownRemaining = (contractId: string) => {
    const lastContract = completedContracts
      .filter(uc => uc.contractId === contractId && uc.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];

    if (!lastContract || !lastContract.completedAt) return null;

    const now = new Date();
    const completionDate = new Date(lastContract.completedAt);
    const cooldownMs = cooldownHours * 60 * 60 * 1000;
    const elapsedMs = now.getTime() - completionDate.getTime();

    if (elapsedMs < cooldownMs) {
      const remainingMs = cooldownMs - elapsedMs;
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Контракты</h1>
          <p className="text-gray-400 mt-1">Доступные контракты для выполнения</p>
        </div>
      </div>

      {/* Active Contracts Section */}
      {activeContracts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-bold text-white">Активные контракты ({activeContracts.length}/3)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeContracts.map((uc) => {
              const isCancelling = cancellingContract === uc.id;
              
              return (
                <Card key={uc.id} className="group h-full bg-[#0a0a0a] border-blue-500/30">
                  <CardContent className="p-5">
                    {/* Active Badge / Report Status */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <Check className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-xs font-bold text-blue-500 uppercase tracking-wide">
                          {uc.reports.length > 0 ? 'Отчет отправлен' : 'Активен'}
                        </span>
                      </div>
                    </div>

                    <ContractCard contract={uc.contract} />
                    
                    <div className="mt-3 pt-3 border-t border-white/5 text-xs text-gray-500 mb-3">
                      Взят: {new Date(uc.startedAt).toLocaleDateString('ru-RU')}
                    </div>

                    {/* Cancel Button */}
                    <Button
                      variant="outline"
                      className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/50"
                      onClick={() => setConfirmCancelId(uc.id)}
                      disabled={isCancelling}
                    >
                      {isCancelling ? (
                        'Отмена...'
                      ) : (
                        <>
                          <X className="w-4 h-4 mr-2" />
                          Отказаться от контракта
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Contracts Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Доступные контракты</h2>
        {contracts.length === 0 ? (
          <Card className="bg-[#0a0a0a] border border-[#1f1f1f]">
            <CardContent className="p-8 text-center text-gray-500">
              Нет доступных контрактов
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {contracts.map((contract) => {
              const isActive = isContractActive(contract.id);
              const cooldown = getCooldownRemaining(contract.id);
              const isTaking = takingContract === contract.id;

              return (
                <Card key={contract.id} className={`group h-full ${isActive || cooldown ? 'opacity-50' : ''}`}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                       <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                          <Users className="w-3 h-3 text-gray-400" />
                          <span className="text-[10px] font-bold text-gray-400 leading-none">
                            {contract.cycleCount}/{contract.maxSlots}
                          </span>
                       </div>
                    </div>
                    <ContractCard contract={contract} />
                    <Button
                      className={`w-full mt-4 ${
                        isActive || cooldown || contract.cycleCount >= contract.maxSlots
                          ? 'bg-gray-700 cursor-not-allowed'
                          : 'bg-[#e81c5a] hover:bg-[#c21548]'
                      }`}
                      onClick={() => handleTakeContract(contract.id)}
                      disabled={isActive || !!cooldown || isTaking || activeContracts.length >= 3 || contract.cycleCount >= contract.maxSlots}
                    >
                      {isTaking ? (
                        'Загрузка...'
                      ) : isActive ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Уже взят
                        </>
                      ) : cooldown ? (
                        <>
                          <Clock className="w-4 h-4 mr-2" />
                          Перезарядка {cooldown.hours}ч {cooldown.minutes}м
                        </>
                      ) : contract.cycleCount >= contract.maxSlots ? (
                        'Мест нет'
                      ) : activeContracts.length >= 3 ? (
                        'Лимит достигнут'
                      ) : (
                        'Взять контракт'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Contract History Section */}
      {completedContracts.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-[#1f1f1f]">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-gray-500" />
            <h2 className="text-xl font-bold text-white">История контрактов</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {completedContracts.map((uc) => (
              <Card key={uc.id} className="bg-[#0a0a0a] border-[#1f1f1f] grayscale opacity-60">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-green-500 bg-green-500/10 px-2 py-1 rounded">
                      Завершен
                    </span>
                    <span className="text-[10px] text-gray-500">
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full bg-[#0a0a0a] border-red-500/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Отказаться от контракта?</h3>
                  <p className="text-sm text-gray-400">
                    Вы уверены, что хотите отказаться от этого контракта? Это действие нельзя отменить.
                  </p>
                </div>
              </div>

              {cancelError && (
                <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-400 leading-relaxed">{cancelError}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setConfirmCancelId(null);
                    setCancelError(null);
                  }}
                >
                  Отмена
                </Button>
                <Button
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                  onClick={() => handleCancelContract(confirmCancelId)}
                  disabled={cancellingContract === confirmCancelId}
                >
                  {cancellingContract === confirmCancelId ? 'Отмена...' : 'Отказаться'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
