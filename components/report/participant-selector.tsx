import { CustomSelect } from '@/components/ui/custom-select';
import { Member } from '@/types/report';
import { Star, Trash2, Users } from 'lucide-react';
import { Session } from 'next-auth';

interface ParticipantSelectorProps {
    selectedIds: string[];
    members: Member[];
    session: Session | null;
    onAdd: (id: string) => void;
    onRemove: (id: string) => void;
}

export function ParticipantSelector({
    selectedIds,
    members,
    session,
    onAdd,
    onRemove
}: ParticipantSelectorProps) {
    return (
        <div className="space-y-4 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Star className="w-3 h-3 text-yellow-500" />
                    Доп. участники
                </label>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                    {selectedIds.length + 1} чел.
                </span>
            </div>

            <div className="flex flex-wrap gap-2">
                {/* Current User Tag */}
                <div className="pl-1.5 pr-3 py-1.5 rounded-full bg-blue-500/5 border border-blue-500/20 text-[10px] text-blue-500/80 font-bold uppercase tracking-widest flex items-center gap-2.5">
                    {session?.user?.image ? (
                        <img src={session.user.image} alt="" className="w-5 h-5 rounded-full object-cover border border-blue-500/30" />
                    ) : (
                        <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                            <Users className="w-2.5 h-2.5" />
                        </div>
                    )}
                    {session?.user?.name} (Вы)
                </div>

                {/* Participant Tags */}
                {selectedIds.map(pid => {
                    const member = members.find(m => m.id === pid);
                    if (!member) return null;
                    return (
                        <div key={pid} className="pl-1.5 pr-1.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-gray-300 font-bold uppercase tracking-widest flex items-center gap-3 group/tag hover:border-white/30 transition-all shadow-sm">
                            <div className="flex items-center gap-2.5">
                                {member.image ? (
                                    <img src={member.image} alt="" className="w-5 h-5 rounded-full object-cover border border-white/20" />
                                ) : (
                                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center border border-white/20 text-gray-400">
                                        <Users className="w-2.5 h-2.5" />
                                    </div>
                                )}
                                <span className="max-w-[100px] truncate">{member.firstName || member.name}</span>
                            </div>
                            <button
                                onClick={() => onRemove(pid)}
                                className="w-5 h-5 flex items-center justify-center rounded-full bg-white/10 text-gray-500 hover:text-red-500 hover:bg-red-500/20 transition-all"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    );
                })}
            </div>

            <CustomSelect
                placeholder="Добавить напарника..."
                options={members
                    .filter(m => m.id !== (session?.user as any)?.id && !selectedIds.includes(m.id))
                    .map(m => ({
                        value: m.id,
                        label: m.firstName ? `${m.firstName} (${m.name})` : m.name || 'Unknown'
                    }))
                }
                value=""
                onChange={onAdd}
                className="max-w-xs"
            />
        </div>
    );
}
