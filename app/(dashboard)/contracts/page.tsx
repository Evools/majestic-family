'use client';

import { ContractCard } from '@/components/contract-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Contract } from '@prisma/client';
import { Briefcase, Check } from 'lucide-react';
import { useEffect, useState } from 'react';

type UserContractWithContract = {
  id: string;
  contractId: string;
  status: string;
  startedAt: string;
  contract: Contract;
};

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [activeContracts, setActiveContracts] = useState<UserContractWithContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [takingContract, setTakingContract] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all contracts
      const contractsRes = await fetch('/api/admin/contracts');
      if (contractsRes.ok) {
        const data = await contractsRes.json();
        setContracts(data.filter((c: Contract) => c.isActive));
      }

      // Fetch user's contracts
      const userContractsRes = await fetch('/api/user/contracts');
      if (userContractsRes.ok) {
        const data = await userContractsRes.json();
        setActiveContracts(data.active || []);
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

  const isContractActive = (contractId: string) => {
    return activeContracts.some(uc => uc.contractId === contractId);
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
            <Briefcase className="w-5 h-5 text-green-500" />
            <h2 className="text-xl font-bold text-white">Активные контракты ({activeContracts.length}/3)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeContracts.map((uc) => (
              <Card key={uc.id} className="group h-full border-green-500/20 bg-green-500/5">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-green-500/20 border border-green-500/30">
                      <Check className="w-3 h-3 text-green-500" />
                      <span className="text-xs font-bold text-green-500">АКТИВЕН</span>
                    </div>
                  </div>
                  <ContractCard contract={uc.contract} />
                  <div className="mt-3 text-xs text-gray-500">
                    Взят: {new Date(uc.startedAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
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
              const isTaking = takingContract === contract.id;

              return (
                <Card key={contract.id} className={`group h-full ${isActive ? 'opacity-50' : ''}`}>
                  <CardContent className="p-5">
                    <ContractCard contract={contract} />
                    <Button
                      className={`w-full mt-4 ${
                        isActive
                          ? 'bg-gray-700 cursor-not-allowed'
                          : 'bg-[#e81c5a] hover:bg-[#c21548]'
                      }`}
                      onClick={() => handleTakeContract(contract.id)}
                      disabled={isActive || isTaking || activeContracts.length >= 3}
                    >
                      {isTaking ? (
                        'Загрузка...'
                      ) : isActive ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Уже взят
                        </>
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
    </div>
  );
}
