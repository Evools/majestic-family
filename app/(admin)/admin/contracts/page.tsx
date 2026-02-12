'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Contract } from '@prisma/client';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reward: '0',
    reputation: '0',
    level: '1',
    icon: 'ClipboardList',
    maxSlots: '10',
    isFlexible: false,
    category: 'General',
  });

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const res = await fetch('/api/admin/contracts');
      if (res.ok) {
        setContracts(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch contracts', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = '/api/admin/contracts';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { ...formData, id: editingId } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await fetchContracts();
        resetForm();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contract?')) return;
    try {
      const res = await fetch(`/api/admin/contracts?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setContracts(prev => prev.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const startEdit = (contract: Contract) => {
    setFormData({
      title: contract.title,
      description: contract.description || '',
      reward: contract.reward.toString(),
      reputation: contract.reputation.toString(),
      level: contract.level.toString(),
      icon: contract.icon,
      maxSlots: contract.maxSlots.toString(),
      isFlexible: contract.isFlexible,
      category: contract.category,
    });
    setEditingId(contract.id);
    setIsCreating(true);
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', reward: '0', reputation: '0', level: '1', icon: 'ClipboardList', maxSlots: '10', isFlexible: false, category: 'General' });
    setEditingId(null);
    setIsCreating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Управление контрактами</h1>
          <p className="text-gray-400">Создание и редактирование доступных контрактов.</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="bg-[#e81c5a] hover:bg-[#c21548] shadow-lg shadow-[#e81c5a]/20">
            <Plus className="w-4 h-4 mr-2" /> Добавить
        </Button>
      </div>

      {isCreating && (
        <Card className="bg-[#0a0a0a] border border-[#1f1f1f] animate-in fade-in slide-in-from-top-4">
            <CardHeader>
                <CardTitle className="text-white text-lg">{editingId ? 'Редактировать контракт' : 'Новый контракт'}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Название</label>
                            <Input 
                                placeholder="Рыбалка" 
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                required
                                className="bg-[#0f0f0f] border-[#1f1f1f] text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Категория</label>
                            <Input 
                                placeholder="Рыбалка, Охота и т.д." 
                                value={formData.category}
                                onChange={e => setFormData({...formData, category: e.target.value})}
                                required
                                className="bg-[#0f0f0f] border-[#1f1f1f] text-white"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Описание</label>
                        <Input 
                            placeholder="Короткое описание" 
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            className="bg-[#0f0f0f] border-[#1f1f1f] text-white"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Награда ($)</label>
                            <Input 
                                type="number"
                                placeholder="150000" 
                                value={formData.reward}
                                onChange={e => setFormData({...formData, reward: e.target.value})}
                                className="bg-[#0f0f0f] border-[#1f1f1f] text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Репутация (XP)</label>
                            <Input 
                                type="number"
                                placeholder="200" 
                                value={formData.reputation}
                                onChange={e => setFormData({...formData, reputation: e.target.value})}
                                className="bg-[#0f0f0f] border-[#1f1f1f] text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Input 
                                type="number"
                                placeholder="10" 
                                value={formData.maxSlots}
                                onChange={e => setFormData({...formData, maxSlots: e.target.value})}
                                disabled={formData.isFlexible}
                                className="bg-[#0f0f0f] border-[#1f1f1f] text-white disabled:opacity-30"
                            />
                        </div>
                        <div className="flex items-center gap-3 self-end h-10 px-1">
                            <Checkbox 
                                id="isFlexible" 
                                checked={formData.isFlexible}
                                onChange={(e) => setFormData({...formData, isFlexible: e.target.checked})}
                            />
                            <label htmlFor="isFlexible" className="text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer select-none">
                                Без лимита мест
                            </label>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" className="text-gray-400 hover:text-white" onClick={resetForm}>Отмена</Button>
                        <Button type="submit" className="bg-green-600 hover:bg-green-700">Сохранить</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contracts.map((contract) => (
             <Card key={contract.id} className="bg-[#0a0a0a] border border-[#1f1f1f] group hover:border-[#e81c5a]/50 transition-colors">
                <CardContent className="p-6 relative">
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(contract)} className="text-gray-400 hover:text-white"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(contract.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <span className="px-2 py-1 rounded bg-[#e81c5a]/10 text-[#e81c5a] text-xs font-bold uppercase tracking-wider border border-[#e81c5a]/20">
                            LVL {contract.level}
                        </span>
                        {/* Icon placeholder logic could be improved to dynamic render */}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{contract.title}</h3>
                    <p className="text-sm text-gray-500 mb-4">{contract.description || 'Нет описания'}</p>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {contract.isFlexible ? (
                            <span className="text-cyan-500">Без лимита участников</span>
                        ) : (
                            <span>Ёмкость: {contract.maxSlots} чел.</span>
                        )}
                        <span className="ml-auto text-[#e81c5a]/60">{contract.category}</span>
                    </div>
                </CardContent>
             </Card>
          ))}
      </div>
    </div>
  );
}
