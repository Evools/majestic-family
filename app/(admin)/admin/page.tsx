import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, FileText, Settings, Users } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const adminLinks = [
    {
      title: "Отчеты",
      description: "Проверка и одобрение отчетов участников.",
      href: "/admin/reports",
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Контракты",
      description: "Создание и редактирование доступных контрактов.",
      href: "/admin/contracts",
      icon: ClipboardList,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Участники",
      description: "Управление ролями и просмотр статистики.",
      href: "/admin/users",
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Настройки",
      description: "Общие настройки семьи и системы.",
      href: "/admin/settings",
      icon: Settings,
      color: "text-gray-500",
      bgColor: "bg-gray-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Панель управления</h1>
        <p className="text-gray-400">Управление семьей и контроль активности.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="h-full bg-[#0a0a0a] border border-[#1f1f1f] hover:border-[#e81c5a]/50 transition-all cursor-pointer group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">
                  {link.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${link.bgColor}`}>
                  <link.icon className={`h-4 w-4 ${link.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500 mt-2">
                  {link.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Stats Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#0a0a0a] border border-[#1f1f1f]">
            <CardHeader>
                <CardTitle className="text-lg text-white">Недавние отчеты</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center py-8 text-gray-500 text-sm">
                    Нет новых отчетов для проверки.
                </div>
            </CardContent>
        </Card>
        
        <Card className="bg-[#0a0a0a] border border-[#1f1f1f]">
            <CardHeader>
                <CardTitle className="text-lg text-white">Статистика за неделю</CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="text-center py-8 text-gray-500 text-sm">
                    Недостаточно данных для отображения графика.
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
