'use client';

import { ContractCard } from '@/components/contract-card';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Package, Swords, Truck, Users } from 'lucide-react';

const CONTRACTS = [
  {
    title: "Дальнобойщик",
    description: "Доставить 50 грузов на склад.",
    reward: 50000,
    xp: 150,
    icon: Truck,
    category: "delivery",
    status: 'active'
  },
  {
    title: "Контроль территории",
    description: "Удерживайте точку 20 минут.",
    reward: 35000,
    xp: 100,
    icon: MapPin,
    category: "pvp",
    status: 'active'
  },
  {
    title: "Сбор ресурсов",
    description: "Соберите 100 мед. материалов.",
    reward: 25000,
    xp: 75,
    icon: Package,
    category: "grind",
    status: 'completed'
  },
  {
    title: "Тренировка состава",
    description: "Провести тренировку (5 чел).",
    reward: 40000,
    xp: 120,
    icon: Users,
    category: "events",
    status: 'locked'
  },
  {
    title: "Нападение на конвой",
    description: "Перехватить вражеский конвой.",
    reward: 100000,
    xp: 500,
    icon: Swords,
    category: "pvp",
    status: 'active'
  },
    {
    title: "Угон транспорта",
    description: "Угнать заказной автомобиль S-класса.",
    reward: 65000,
    xp: 200,
    icon: Truck,
    category: "crime",
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
