'use client';

import { ContractCard } from '@/components/contract-card';
import { Card, CardContent } from '@/components/ui/card';
import { Contract } from '@prisma/client';
import { useEffect, useState } from 'react';

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const res = await fetch('/api/admin/contracts');
      if (res.ok) {
        const data = await res.json();
        setContracts(data.filter((c: Contract) => c.isActive));
      }
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
    } finally {
      setLoading(false);
    }
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

      {contracts.length === 0 ? (
        <Card className="bg-[#0a0a0a] border border-[#1f1f1f]">
          <CardContent className="p-8 text-center text-gray-500">
            Нет доступных контрактов
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {contracts.map((contract) => (
            <Card key={contract.id} className="group h-full">
              <CardContent className="p-5">
                <ContractCard contract={contract} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
