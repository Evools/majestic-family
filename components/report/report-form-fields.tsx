import { Input } from '@/components/ui/input';
import { ReportFormState } from '@/types/report';
import { ImageUpload } from '../ui/image-upload';

interface ReportFormFieldsProps {
    form: ReportFormState;
    index: number;
    onUpdate: (field: keyof ReportFormState, value: string) => void;
}

export function ReportFormFields({ form, index, onUpdate }: ReportFormFieldsProps) {
    return (
        <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Предмет</label>
                    <Input
                        placeholder="Например: Кабель"
                        className="bg-[#050505] border-white/10 text-sm text-white placeholder:text-gray-700 focus-visible:ring-blue-500/30"
                        value={form.itemName}
                        onChange={(e) => onUpdate('itemName', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Количество</label>
                    <Input
                        type="number"
                        placeholder="0"
                        min="1"
                        className="bg-[#050505] border-white/10 text-sm text-white placeholder:text-gray-700 focus-visible:ring-blue-500/30"
                        value={form.quantity}
                        onChange={(e) => onUpdate('quantity', e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Доказательства (Скриншот)</label>
                <ImageUpload
                    value={form.proof}
                    onChange={(url) => onUpdate('proof', url)}
                />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Комментарий</label>
                <textarea
                    className="w-full min-h-[80px] bg-[#050505] border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 resize-y transition-all"
                    placeholder="Дополнительные детали..."
                    value={form.comment}
                    onChange={(e) => onUpdate('comment', e.target.value)}
                />
            </div>
        </div>
    );
}
