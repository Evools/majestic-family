import { Button } from '@/components/ui/button';
import { UserContractWithContract } from '@/types/report';
import { DollarSign, Star, Trash2 } from 'lucide-react';

interface ContractHeaderProps {
    uc: UserContractWithContract;
    onRemove: () => void;
}

export function ContractHeader({ uc, onRemove }: ContractHeaderProps) {
    return (
        <div className="flex items-start justify-between mb-6 pb-4 border-b border-white/10">
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-white text-lg tracking-tight">{uc.contract.title}</h3>
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                        LVL {uc.contract.level}
                    </span>
                </div>
                {uc.contract.description && (
                    <p className="text-sm text-gray-400 mb-3">{uc.contract.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-1.5 text-green-500">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>${uc.contract.reward.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-yellow-500">
                        <Star className="w-3.5 h-3.5" />
                        <span>+{uc.contract.reputation} XP</span>
                    </div>
                </div>
            </div>
            <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-red-500 hover:bg-red-500/5 transition-colors"
                onClick={onRemove}
            >
                <Trash2 className="w-4 h-4" />
            </Button>
        </div>
    );
}
