'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    level: '1',
    icon: 'ClipboardList',
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
      level: contract.level.toString(),
      icon: contract.icon,
    });
    setEditingId(contract.id);
    setIsCreating(true);
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', level: '1', icon: 'ClipboardList' });
    setEditingId(null);
    setIsCreating(false);
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Управление контрактами</h1>
        <Button onClick={() => setIsCreating(true)} className="bg-[#e81c5a] hover:bg-[#c21548]">
            <Plus className="w-4 h-4 mr-2" /> Добавить
        </Button>
      </div>

      {isCreating && (
        <Card className="bg-[#1a1a1a] border border-[#2f2f2f] mb-6 animate-in fade-in slide-in-from-top-4">
            <CardHeader>
                <CardTitle className="text-white text-lg">{editingId ? 'Редактировать контракт' : 'Новый контракт'}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                            placeholder="Название (например: Рыбалка)" 
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            required
                            className="bg-[#0a0a0a]"
                        />
                         <Input 
                            type="number"
                            placeholder="Уровень (1-10)" 
                            value={formData.level}
                            onChange={e => setFormData({...formData, level: e.target.value})}
                            required
                            className="bg-[#0a0a0a]"
                        />
                    </div>
                    <Input 
                        placeholder="Короткое описание" 
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="bg-[#0a0a0a]"
                    />
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={resetForm}>Отмена</Button>
                        <Button type="submit" className="bg-green-600 hover:bg-green-700">Сохранить</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contracts.map((contract) => (
             <Card key={contract.id} className="bg-[#0a0a0a] border border-[#1f1f1f] group hover:border-gray-700 transition-colors">
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
                    <p className="text-sm text-gray-500">{contract.description || 'Нет описания'}</p>
                </CardContent>
             </Card>
          ))}
      </div>
    </div>
  );
}
