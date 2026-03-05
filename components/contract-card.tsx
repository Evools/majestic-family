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
            <h3 className="text-lg font-semibold text-white tracking-tight leading-tight truncate group-hover/card:text-[#e81c5a] transition-colors duration-300">
              {title}
            </h3>
            <span className="shrink-0 px-2 py-0.5 rounded-full bg-white/10 text-gray-300 text-xs font-medium">
              Ур. {level}
            </span>
            {contract.category && contract.category !== "General" && (
              <span className="shrink-0 px-2 py-0.5 rounded-full bg-[#e81c5a]/10 text-[#e81c5a] text-xs font-medium">
                {contract.category}
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm font-normal leading-relaxed line-clamp-3">
            {description || 'Описания нет'}
          </p>
        </div>
      </div>
      
      {/* Rewards Grid */}
      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Награда:</span>
          <span className="text-lg font-semibold text-white tracking-tight">
            ${reward.toLocaleString('en-US').replace(/,/g, ' ')}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Опыт:</span>
          <div className="flex items-center">
            <span className="text-lg font-semibold text-[#e81c5a] tracking-tight">
              +{reputation} XP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
