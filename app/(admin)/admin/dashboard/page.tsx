'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    bonusActive: false,
    bonusTitle: '',
    bonusDescription: '',
    familyBalance: 0,
    goalName: '',
    goalTarget: 0,
    goalCurrent: 0,
    familyLevel: 1,
    familyXP: 0,
    familyXPRequired: 1000,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      if (res.ok) {
        const data = await res.json();
        setFormData({
          bonusActive: data.bonusActive || false,
          bonusTitle: data.bonusTitle || '',
          bonusDescription: data.bonusDescription || '',
          familyBalance: data.familyBalance || 0,
          goalName: data.goalName || '',
          goalTarget: data.goalTarget || 0,
          goalCurrent: data.goalCurrent || 0,
          familyLevel: data.familyLevel || 1,
          familyXP: data.familyXP || 0,
          familyXPRequired: data.familyXPRequired || 1000,
        });
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    });
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.checked,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/dashboard', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || 'Failed to save settings');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Настройки дашборда</h1>
        <p className="text-gray-400">Управление блоками на главной странице</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Active Bonus */}
        <Card className="bg-[#0a0a0a] border border-[#1f1f1f]">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Активный бонус</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="bonusActive"
                  checked={formData.bonusActive}
                  onChange={handleCheckbox}
                  className="w-4 h-4 rounded bg-[#0f0f0f] border-[#1f1f1f]"
                />
                <label className="text-sm text-gray-300">Показать бонус на дашборде</label>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Заголовок</label>
                <Input
                  name="bonusTitle"
                  value={formData.bonusTitle}
                  onChange={handleChange}
                  placeholder="X2 Опыт на все выходные"
                  className="bg-[#0f0f0f] border-[#1f1f1f] text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Описание</label>
                <textarea
                  name="bonusDescription"
                  value={formData.bonusDescription}
                  onChange={handleChange}
                  placeholder="Все контракты приносят удвоенное количество опыта..."
                  className="w-full min-h-[80px] bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#e81c5a] focus:ring-1 focus:ring-[#e81c5a]/50 resize-y"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Family Balance */}
        <Card className="bg-[#0a0a0a] border border-[#1f1f1f]">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Баланс Семьи</h3>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Текущий баланс ($)</label>
              <Input
                name="familyBalance"
                type="number"
                value={formData.familyBalance}
                onChange={handleChange}
                placeholder="4250590"
                className="bg-[#0f0f0f] border-[#1f1f1f] text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Financial Goal */}
        <Card className="bg-[#0a0a0a] border border-[#1f1f1f]">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Финансовая цель</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Название цели</label>
                <Input
                  name="goalName"
                  value={formData.goalName}
                  onChange={handleChange}
                  placeholder="Покупка Особняка"
                  className="bg-[#0f0f0f] border-[#1f1f1f] text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Целевая сумма ($)</label>
                  <Input
                    name="goalTarget"
                    type="number"
                    value={formData.goalTarget}
                    onChange={handleChange}
                    placeholder="10000000"
                    className="bg-[#0f0f0f] border-[#1f1f1f] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Собрано ($)</label>
                  <Input
                    name="goalCurrent"
                    type="number"
                    value={formData.goalCurrent}
                    onChange={handleChange}
                    placeholder="4200000"
                    className="bg-[#0f0f0f] border-[#1f1f1f] text-white"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Family Level */}
        <Card className="bg-[#0a0a0a] border border-[#1f1f1f]">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Уровень семьи</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Текущий уровень</label>
                <Input
                  name="familyLevel"
                  type="number"
                  value={formData.familyLevel}
                  onChange={handleChange}
                  placeholder="5"
                  className="bg-[#0f0f0f] border-[#1f1f1f] text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Текущий XP</label>
                  <Input
                    name="familyXP"
                    type="number"
                    value={formData.familyXP}
                    onChange={handleChange}
                    placeholder="850"
                    className="bg-[#0f0f0f] border-[#1f1f1f] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Требуется XP</label>
                  <Input
                    name="familyXPRequired"
                    type="number"
                    value={formData.familyXPRequired}
                    onChange={handleChange}
                    placeholder="1000"
                    className="bg-[#0f0f0f] border-[#1f1f1f] text-white"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success/Error Messages */}
        {success && (
          <div className="p-4 rounded-lg bg-green-500/10 text-green-500 border border-green-500/20 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Настройки успешно сохранены!</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-[#e81c5a] hover:bg-[#c21548] text-white shadow-lg shadow-[#e81c5a]/20"
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>
        </div>
      </form>
    </div>
  );
}
