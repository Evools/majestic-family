import { Contract } from '@prisma/client';

interface ContractCardProps {
    contract: Contract;
}

export function ContractCard({ contract }: ContractCardProps) {
  const { title, description, reward, reputation, icon: iconName, level, isActive } = contract;
  
  return (
    <div className="flex flex-col h-full relative group/card">
      {/* Level and Title Section */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="grow">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-white tracking-tight uppercase leading-none truncate group-hover/card:text-[#e81c5a] transition-colors duration-300">
              {title}
            </h3>
            <span className="shrink-0 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
              LVL {level}
            </span>
            {contract.category && contract.category !== "General" && (
              <span className="shrink-0 px-2 py-0.5 rounded bg-[#e81c5a]/10 border border-[#e81c5a]/20 text-[#e81c5a] text-[10px] font-bold uppercase tracking-wider">
                {contract.category}
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm font-normal leading-relaxed line-clamp-2">
            {description || 'Спецификации контракта не указаны'}
          </p>
        </div>
      </div>
      
      {/* Rewards Grid */}
      <div className="mt-auto pt-5 border-t border-white/5 grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Награда</span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-sm font-bold text-white leading-none">$</span>
            <span className="text-xl font-bold text-white font-mono leading-none tracking-tight">
              {reward.toLocaleString('en-US').replace(/,/g, ' ')}
            </span>
          </div>
        </div>
        
        <div className="space-y-1 text-right">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Опыт</span>
          <div className="flex items-center justify-end gap-1">
            <span className="text-xl font-bold text-[#e81c5a] font-mono leading-none tracking-tight drop-shadow-[0_0_10px_rgba(232,28,90,0.15)]">
              +{reputation}
            </span>
            <span className="text-[10px] font-bold text-[#e81c5a] uppercase leading-none">XP</span>
          </div>
        </div>
      </div>
    </div>
  );
}
