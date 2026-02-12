'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { AlertCircle, Bell, CheckCircle2, DollarSign, FileText, Info, Save, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    familyName: '',
    familyDescription: '',
    familyLogoUrl: '',
    userSharePercent: 60,
    familySharePercent: 40,
    minWithdrawal: 10000,
    contractCooldownHours: 24,
    autoApproveReports: false,
    xpMultiplier: 1.5,
    baseXPRequired: 1000,
    discordWebhook: '',
    notifyNewReports: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setFormData({
          familyName: data.familyName || '',
          familyDescription: data.familyDescription || '',
          familyLogoUrl: data.familyLogoUrl || '',
          userSharePercent: data.userSharePercent || 60,
          familySharePercent: data.familySharePercent || 40,
          minWithdrawal: data.minWithdrawal || 10000,
          contractCooldownHours: data.contractCooldownHours || 24,
          autoApproveReports: data.autoApproveReports || false,
          xpMultiplier: data.xpMultiplier || 1.5,
          baseXPRequired: data.baseXPRequired || 1000,
          discordWebhook: data.discordWebhook || '',
          notifyNewReports: data.notifyNewReports !== undefined ? data.notifyNewReports : true,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Настройки системы</h1>
        <p className="text-gray-400">Управление общими настройками семьи</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Family Information */}
          <Card className="bg-[#0a0a0a] border border-[#1f1f1f]">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Info className="w-5 h-5 text-purple-500" />
                </div>
                <h3 className="text-lg font-bold text-white">Информация о семье</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Название семьи</label>
                  <Input
                    name="familyName"
                    value={formData.familyName}
                    onChange={handleChange}
                    placeholder="Shelby Family"
                    className="bg-[#0f0f0f] border-[#1f1f1f] text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Описание</label>
                  <textarea
                    name="familyDescription"
                    value={formData.familyDescription}
                    onChange={handleChange}
                    placeholder="Описание вашей семьи..."
                    className="w-full min-h-[80px] bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#e81c5a] focus:ring-1 focus:ring-[#e81c5a]/50 resize-y"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">URL логотипа</label>
                  <Input
                    name="familyLogoUrl"
                    value={formData.familyLogoUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/logo.png"
                    className="bg-[#0f0f0f] border-[#1f1f1f] text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Settings */}
          <Card className="bg-[#0a0a0a] border border-[#1f1f1f]">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-yellow-500" />
                </div>
                <h3 className="text-lg font-bold text-white">Финансовые настройки</h3>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Доля участника (%)</label>
                    <Input
                      name="userSharePercent"
                      type="number"
                      value={formData.userSharePercent}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      className="bg-[#0f0f0f] border-[#1f1f1f] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Доля семьи (%)</label>
                    <Input
                      name="familySharePercent"
                      type="number"
                      value={formData.familySharePercent}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      className="bg-[#0f0f0f] border-[#1f1f1f] text-white"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Минимальная сумма вывода ($)</label>
                  <Input
                    name="minWithdrawal"
                    type="number"
                    value={formData.minWithdrawal}
                    onChange={handleChange}
                    min="0"
                    placeholder="10000"
                    className="bg-[#0f0f0f] border-[#1f1f1f] text-white"
                  />
                </div>
                
                <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                  <p className="text-xs text-blue-400">
                    Сумма: {formData.userSharePercent}% участнику + {formData.familySharePercent}% семье = {formData.userSharePercent + formData.familySharePercent}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contract Settings */}
          <Card className="bg-[#0a0a0a] border border-[#1f1f1f]">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-lg font-bold text-white">Настройки контрактов</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Кулдаун контракта (часы)</label>
                  <Input
                    name="contractCooldownHours"
                    type="number"
                    value={formData.contractCooldownHours}
                    onChange={handleChange}
                    min="0"
                    placeholder="24"
                    className="bg-[#0f0f0f] border-[#1f1f1f] text-white"
                  />
                  <p className="text-xs text-gray-500">Время ожидания после выполнения контракта</p>
                </div>
                
                <Checkbox
                  label="Автоматическое одобрение отчетов"
                  checked={formData.autoApproveReports}
                  onChange={(e) => setFormData({ ...formData, autoApproveReports: e.target.checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Level System */}
          <Card className="bg-[#0a0a0a] border border-[#1f1f1f]">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[#e81c5a]/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[#e81c5a]" />
                </div>
                <h3 className="text-lg font-bold text-white">Система уровней</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Множитель XP</label>
                  <Input
                    name="xpMultiplier"
                    type="number"
                    step="0.1"
                    value={formData.xpMultiplier}
                    onChange={handleChange}
                    min="1"
                    placeholder="1.5"
                    className="bg-[#0f0f0f] border-[#1f1f1f] text-white"
                  />
                  <p className="text-xs text-gray-500">Множитель для расчета XP следующего уровня</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Базовый XP (уровень 2)</label>
                  <Input
                    name="baseXPRequired"
                    type="number"
                    value={formData.baseXPRequired}
                    onChange={handleChange}
                    min="0"
                    placeholder="1000"
                    className="bg-[#0f0f0f] border-[#1f1f1f] text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-[#0a0a0a] border border-[#1f1f1f] lg:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-lg font-bold text-white">Уведомления</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Discord Webhook URL</label>
                  <Input
                    name="discordWebhook"
                    value={formData.discordWebhook}
                    onChange={handleChange}
                    placeholder="https://discord.com/api/webhooks/..."
                    className="bg-[#0f0f0f] border-[#1f1f1f] text-white"
                  />
                  <p className="text-xs text-gray-500">Webhook для отправки уведомлений в Discord</p>
                </div>
                
                <Checkbox
                  label="Уведомления о новых отчетах"
                  checked={formData.notifyNewReports}
                  onChange={(e) => setFormData({ ...formData, notifyNewReports: e.target.checked })}
                />
              </div>
            </CardContent>
          </Card>
        </div>

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
            {saving ? 'Сохранение...' : 'Сохранить настройки'}
          </Button>
        </div>
      </form>
    </div>
  );
}
