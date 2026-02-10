'use client';

import { cn } from '@/lib/utils';
import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Send,
  Settings,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Дашборд', href: '/', icon: LayoutDashboard },
  { name: 'Контракты', href: '/contracts', icon: ClipboardList },
  { name: 'Сдать отчет', href: '/report', icon: Send },
  { name: 'Состав', href: '/members', icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-screen w-64 bg-[#0a0a0a] border-r border-[#1f1f1f] fixed left-0 top-0 z-50">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-[#1f1f1f]">
        <div className="w-8 h-8 rounded-lg bg-[#e81c5a] flex items-center justify-center text-white font-bold">
          S
        </div>
        <span className="font-bold text-lg text-white tracking-wide">SHELBY</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-3">
          Основное
        </div>
        
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive 
                  ? "bg-[#e81c5a]/10 text-[#e81c5a]" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                isActive ? "text-[#e81c5a]" : "text-gray-500 group-hover:text-white"
              )} />
              {item.name}
            </Link>
          );
        })}

        <div className="mt-8 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-3">
          Система
        </div>
        
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all group">
          <Settings className="w-5 h-5 text-gray-500 group-hover:text-white" />
          Настройки
        </button>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-[#1f1f1f]">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#e81c5a] to-purple-600 border border-white/10" />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-white truncate">Reid Shelby</span>
            <span className="text-xs text-gray-500 truncate">Leader</span>
          </div>
          <LogOut className="w-4 h-4 text-gray-500 ml-auto hover:text-[#e81c5a]" />
        </div>
      </div>
    </div>
  );
}
