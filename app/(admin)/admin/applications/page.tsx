"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, Clock, Hash, Loader2, RefreshCw, Shield, X } from "lucide-react";
import { useEffect, useState } from "react";

type Application = {
  id: string;
  discordName: string;
  discordId: string;
  age: number;
  staticId: string;
  experience: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
};

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/applications");
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (error) {
      console.error("Failed to fetch applications", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
    setProcessing(id);
    try {
      const res = await fetch("/api/admin/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (res.ok) {
        setApplications((prev) =>
          prev.map((app) => (app.id === id ? { ...app, status } : app))
        );
      }
    } catch (error) {
      console.error("Failed to update status", error);
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="px-2.5 py-1 rounded-lg bg-green-500/10 text-green-500 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border border-green-500/20">
            <Check className="h-3.5 w-3.5" /> Одобрено
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-500 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border border-red-500/20">
            <X className="h-3.5 w-3.5" /> Отклонено
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-lg bg-yellow-500/10 text-yellow-500 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border border-yellow-500/20">
            <Clock className="h-3.5 w-3.5" /> На рассмотрении
          </span>
        );
    }
  };

  if (loading && applications.length === 0) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#e81c5a]" />
          <p className="text-gray-500 font-medium">Загрузка заявок...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Заявки на вступление</h1>
          <p className="text-gray-400 mt-1">Управление анкетами кандидатов.</p>
        </div>
        <Button 
          onClick={fetchApplications} 
          variant="outline" 
          disabled={loading}
          className="border-[#1f1f1f] bg-[#0a0a0a] text-white hover:bg-white/5 hover:text-white"
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
          Обновить
        </Button>
      </div>

      <div className="grid gap-4">
        {applications.length === 0 ? (
          <Card className="bg-[#0a0a0a] border-[#1f1f1f] p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#1f1f1f]/50 flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Заявок пока нет</h3>
            <p className="text-gray-500 max-w-sm">
              Новые заявки появятся здесь, когда кандидаты заполнят форму.
            </p>
          </Card>
        ) : (
          applications.map((app) => (
            <Card key={app.id} className="bg-[#0a0a0a] border-[#1f1f1f] group hover:border-[#2f2f2f] transition-colors overflow-hidden">
               <div className={cn(
                  "h-1 w-full",
                  app.status === 'PENDING' ? "bg-yellow-500/50" :
                  app.status === 'APPROVED' ? "bg-green-500/50" : "bg-red-500/50"
               )} />
              <CardHeader className="pb-3 border-b border-[#1f1f1f]/50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-[#1f1f1f] flex items-center justify-center text-lg font-bold text-white shrink-0">
                      {app.age}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                        {app.discordName}
                      </CardTitle>
                      <div className="flex items-center gap-3 text-xs text-gray-500 font-medium mt-1">
                        <span className="flex items-center gap-1.5 bg-[#1f1f1f] px-2 py-0.5 rounded">
                           ID: {app.discordId}
                        </span>
                        <span>•</span>
                        <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div>{getStatusBadge(app.status)}</div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                     <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Hash className="w-3 h-3" />
                            Статический ID
                        </h4>
                        <div className="text-sm text-gray-300 bg-[#1f1f1f]/50 p-3 rounded-lg border border-[#1f1f1f] font-mono">
                            {app.staticId}
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Опыт игры</h4>
                        <div className="text-sm text-gray-300 bg-[#1f1f1f]/30 p-4 rounded-lg border border-[#1f1f1f] leading-relaxed whitespace-pre-wrap">
                            {app.experience}
                        </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="flex flex-col h-full">
                     <div className="flex-1">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Причина вступления</h4>
                        <div className="text-sm text-gray-300 bg-[#1f1f1f]/30 p-4 rounded-lg border border-[#1f1f1f] leading-relaxed whitespace-pre-wrap h-[calc(100%-2rem)]">
                            {app.reason}
                        </div>
                    </div>
                  </div>
                </div>

                {app.status === "PENDING" && (
                  <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-[#1f1f1f]">
                    <Button
                      onClick={() => updateStatus(app.id, "REJECTED")}
                      disabled={!!processing}
                      variant="ghost"
                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    >
                      {processing === app.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <X className="h-4 w-4 mr-2" />}
                      Отклонить
                    </Button>
                    <Button
                      onClick={() => updateStatus(app.id, "APPROVED")}
                      disabled={!!processing}
                      className="bg-green-600 hover:bg-green-700 text-white border-none shadow-[0_0_20px_-5px_rgba(22,163,74,0.4)]"
                    >
                      {processing === app.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                      Одобрить заявку
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
