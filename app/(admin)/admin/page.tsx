import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, FileText, LayoutDashboard, Settings, Users } from "lucide-react";
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
      title: "Дашборд",
      description: "Настройка блоков главной страницы (бонусы, баланс, цели).",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      color: "text-[#e81c5a]",
      bgColor: "bg-[#e81c5a]/10",
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="h-full bg-[#0a0a0a] border border-[#1f1f1f] hover:border-[#e81c5a]/50 transition-all cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg ${link.bgColor} flex items-center justify-center`}>
                    <link.icon className={`h-6 w-6 ${link.color}`} />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#e81c5a] transition-colors">
                  {link.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {link.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
