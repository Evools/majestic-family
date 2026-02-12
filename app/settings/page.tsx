"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  
  // Initialize state with session data or empty strings
  const user = session?.user as any;

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    staticId: user?.staticId || "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Не удалось обновить настройки");
      }

      // Update session client-side
      await update({
        ...formData,
      });

      setSuccess(true);
      router.refresh();
      
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div>
            <h1 className="text-3xl font-bold text-white">Настройки профиля</h1>
            <p className="text-gray-400">Укажите свои игровые данные для корректного отображения в системе.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Имя</label>
                        <Input
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="Ivan"
                            className="bg-[#0a0a0a] border-[#1f1f1f] text-white placeholder:text-gray-600 focus-visible:ring-[#e81c5a]/50" 
                            required
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Фамилия</label>
                        <Input
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Ivanov"
                            className="bg-[#0a0a0a] border-[#1f1f1f] text-white placeholder:text-gray-600 focus-visible:ring-[#e81c5a]/50" 
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Static ID</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10">#</span>
                        <Input
                            name="staticId"
                            value={formData.staticId}
                            onChange={handleChange}
                            placeholder="12345"
                            className="bg-[#0a0a0a] border-[#1f1f1f] text-white placeholder:text-gray-600 focus-visible:ring-[#e81c5a]/50 pl-8" 
                            required
                        />
                    </div>
                    <p className="text-[10px] text-gray-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Ваш уникальный идентификатор в игре.
                    </p>
                </div>

                {success && (
                    <div className="p-4 rounded-lg bg-green-500/10 text-green-500 border border-green-500/20 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Профиль успешно обновлен!</span>
                    </div>
                )}

                {errorMsg && (
                    <div className="p-4 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                <div className="pt-4 flex justify-end border-t border-white/5">
                    <Button 
                        type="submit" 
                        className="bg-[#e81c5a] hover:bg-[#c21548] text-white shadow-lg shadow-[#e81c5a]/20" 
                        disabled={loading}
                    >
                        {loading ? 'Сохранение...' : 'Сохранить изменения'}
                    </Button>
                </div>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
