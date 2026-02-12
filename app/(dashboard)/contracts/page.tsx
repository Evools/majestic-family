'use client';

import { ContractCard } from '@/components/contract-card';
import { Card, CardContent } from '@/components/ui/card';
import { Box, Fish, Hammer, Scissors } from 'lucide-react';

const CONTRACTS = [
  {
    title: "Металлургия",
    description: "Переплавка руды и создание слитков.",
    reward: 150000,
    xp: 200,
    icon: Hammer,
    category: "crafting",
    status: 'active'
  },
  {
    title: "Рыбалка X уровня",
    description: "Вылов редкой рыбы для семьи.",
    reward: 120000,
    xp: 150,
    icon: Fish,
    category: "gathering",
    status: 'active'
  },
  {
    title: "Коробки",
    description: "Сбор и доставка коробок с материалами.",
    reward: 80000,
    xp: 100,
    icon: Box,
    category: "delivery",
    status: 'active'
  },
  {
    title: "Ателье",
    description: "Пошив одежды и аксессуаров под заказ.",
    reward: 130000,
    xp: 180,
    icon: Scissors,
    category: "crafting",
    status: 'active'
  },
] as const;

export default function ContractsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Контракты</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {CONTRACTS.map((contract, i) => (
            <Card key={i} className="group h-full">
                <CardContent className="p-5">
                    <ContractCard contract={CONTRACTS[i]} />
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}
