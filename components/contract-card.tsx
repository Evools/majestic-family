import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Clock, LucideIcon } from 'lucide-react';

interface ContractProps {
    title: string;
    description: string;
    reward: number;
    xp?: number;
    icon?: LucideIcon;
    status?: 'active' | 'completed' | 'locked';
    category?: string;
}

interface ContractCardProps {
    contract: ContractProps;
}

export function ContractCard({ contract }: ContractCardProps) {
  const { title, description, reward, xp, icon: Icon, status = 'active' } = contract;
  
  return (
    <div className={cn(
      "flex flex-col h-full relative z-10",
      status === 'locked' && "opacity-40 grayscale pointer-events-none"
    )}>
        {/* Top Meta Row */}
      <div className="flex items-start justify-between mb-6">
        <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 border",
            status === 'active' 
                ? "bg-[#e81c5a]/10 text-[#e81c5a] border-[#e81c5a]/20" 
                : "bg-white/5 text-gray-400 border-white/5"
        )}>
          {Icon ? <Icon className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
        </div>
        
        {status === 'active' && (
            <span className="px-2.5 py-1 rounded-md bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] uppercase font-bold tracking-wider">
                Доступно
            </span>
        )}
         {status === 'completed' && (
            <span className="px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] uppercase font-bold tracking-wider">
                Выполнено
            </span>
        )}
        {status === 'locked' && (
            <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-gray-500 text-[10px] uppercase font-bold tracking-wider">
                Недоступно
            </span>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-grow">
        <h3 className="text-xl font-bold text-white mb-2 leading-tight">
            {title}
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed mb-4">
          {description}
        </p>
      </div>
      
      {/* Footer Info */}
      <div className="mt-auto">
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5 mb-4">
            <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1">Награда</span>
                <span className="text-white font-bold font-mono text-lg">${reward.toLocaleString('en-US')}</span>
            </div>
            
            {xp && (
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1">Репутация</span>
                    <span className="text-[#e81c5a] font-bold font-mono text-lg drop-shadow-[0_0_8px_rgba(232,28,90,0.3)]">+{xp} XP</span>
                </div>
            )}
        </div>

        {status === 'active' && (
             <Button className="w-full bg-[#e81c5a] hover:bg-[#c21548] text-white border-0 transition-all font-bold py-3 h-auto text-[10px] uppercase tracking-widest">
                Подписать контракт
             </Button>
        )}
         {status !== 'active' && (
             <Button disabled className="w-full bg-white/5 text-gray-500 border border-white/5 font-medium py-3 h-auto text-[10px] uppercase tracking-widest opacity-50">
                {status === 'completed' ? 'Уже выполнено' : 'Требуется ранг'}
             </Button>
        )}
      </div>
    </div>
  );
}
