"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";

export default function ApplyPage() {
  const [formData, setFormData] = useState({
    discordId: "",
    discordName: "",
    age: "",
    staticId: "",
    experience: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        console.log("Error response data:", data); // Debug log
        
        if (data.errors) {
            const newErrors: Record<string, string> = {};
            // Handle both Zod array format and potentially other formats
            if (Array.isArray(data.errors)) {
                data.errors.forEach((err: any) => {
                    const path = err.path ? err.path[0] : 'global';
                    newErrors[path] = err.message;
                });
            } else {
                 console.error("Unknown error format:", data.errors);
            }
            setErrors(newErrors);
        } else {
            throw new Error(data.error || "Что-то пошло не так");
        }
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error(err);
      setErrors({ global: "Не удалось отправить заявку. Пожалуйста, попробуйте снова." });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#121216] px-4">
        <Card className="w-full max-w-md border-[#2e2e36] bg-[#18181b]">
          <CardHeader>
            <CardTitle className="text-2xl text-[#e81c5a]">Заявка отправлена!</CardTitle>
            <CardDescription className="text-gray-400">
              Спасибо за вашу заявку в семью Shelby.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-6">
              Ваша заявка получена. Наше руководство рассмотрит ее в ближайшее время.
              Пожалуйста, убедитесь, что вы также находитесь в нашем Discord сервере для получения дальнейших инструкций.
            </p>
            <Button 
              onClick={() => window.location.href = "/"}
              className="w-full bg-[#e81c5a] hover:bg-[#c4164b] text-white"
            >
              Вернуться на главную
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121216] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">Вступить в семью</h1>
          <p className="text-gray-400">Подайте заявку, чтобы стать частью наследия.</p>
        </div>

        <Card className="border-[#2e2e36] bg-[#18181b] shadow-xl">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {Object.keys(errors).length > 0 && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm space-y-1">
                  <div className="flex items-center gap-2 font-medium mb-2">
                    <ShieldCheck className="w-5 h-5 text-red-500" />
                    Пожалуйста, исправьте следующие ошибки:
                  </div>
                  <ul className="list-disc list-inside space-y-1 ml-1">
                    {Object.entries(errors).map(([key, value]) => (
                      <li key={key}>{value}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="discordName" className="text-gray-300">Имя в Discord (например, User#1234)</Label>
                  <Input
                    id="discordName"
                    value={formData.discordName}
                    onChange={(e) => setFormData({ ...formData, discordName: e.target.value })}
                    placeholder="Введите ваш никнейм в Discord"
                    className={cn(
                      "bg-[#27272a] border-[#3f3f46] text-white",
                      errors.discordName && "border-red-500/50 focus-visible:ring-red-500/20"
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discordId" className="text-gray-300">Discord ID</Label>
                  <Input
                    id="discordId"
                    value={formData.discordId}
                    onChange={(e) => setFormData({ ...formData, discordId: e.target.value })}
                    placeholder="ПКМ в Discord -> Копировать ID"
                    className={cn(
                      "bg-[#27272a] border-[#3f3f46] text-white",
                      errors.discordId && "border-red-500/50 focus-visible:ring-red-500/20"
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age" className="text-gray-300">Возраст (OOC)</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Ваш реальный возраст"
                    className={cn(
                      "bg-[#27272a] border-[#3f3f46] text-white",
                      errors.age && "border-red-500/50 focus-visible:ring-red-500/20"
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staticId" className="text-gray-300">Ваш статический ID</Label>
                  <Input
                    id="staticId"
                    value={formData.staticId}
                    onChange={(e) => setFormData({ ...formData, staticId: e.target.value })}
                    placeholder="Например: #12345"
                    className={cn(
                      "bg-[#27272a] border-[#3f3f46] text-white",
                      errors.staticId && "border-red-500/50 focus-visible:ring-red-500/20"
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience" className="text-gray-300">RP Опыт</Label>
                <textarea
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  rows={4}
                  className={cn(
                    "flex w-full rounded-xl border border-[#3f3f46] bg-[#27272a] px-4 py-2 text-sm ring-offset-[#121216] placeholder:text-[#a1a1aa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e81c5a] disabled:cursor-not-allowed disabled:opacity-50 transition-all text-white",
                    errors.experience && "border-red-500/50 focus-visible:ring-red-500/20"
                  )}
                  placeholder="Расскажите о ваших прошлых семьях и фракциях..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason" className="text-gray-300">Почему вы хотите вступить к нам?</Label>
                <textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={4}
                  className={cn(
                    "flex w-full rounded-xl border border-[#3f3f46] bg-[#27272a] px-4 py-2 text-sm ring-offset-[#121216] placeholder:text-[#a1a1aa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e81c5a] disabled:cursor-not-allowed disabled:opacity-50 transition-all text-white",
                    errors.reason && "border-red-500/50 focus-visible:ring-red-500/20"
                  )}
                  placeholder="Чем вы можете быть полезны семье?"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-[#e81c5a] hover:bg-[#c4164b] text-white px-8 py-6 rounded-xl text-lg font-medium shadow-lg shadow-red-900/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Отправка...
                    </>
                  ) : (
                    "Отправить заявку"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
