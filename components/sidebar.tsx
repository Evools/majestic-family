'use client';

import { OnlineUsers } from '@/components/online-users';
import { cn } from '@/lib/utils';
import {
    Book,
    ClipboardList,
    Clock,
    LayoutDashboard,
    LogOut,
    Send,
    Trophy,
    User,
    Users,
    Wallet
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
    {
        title: "Основное",
        items: [
            { name: 'Дашборд', href: '/', icon: LayoutDashboard },
            { name: 'Профиль', href: '/profile', icon: User },
        ]
    },
    {
        title: "Семья",
        items: [
            { name: 'Состав', href: '/members', icon: Users },
            { name: 'Зал Славы', href: '/leaderboard', icon: Trophy },
            { name: 'База знаний', href: '/wiki', icon: Book },
        ]
    },
    {
        title: "Работа",
        items: [
            { name: 'Контракты', href: '/contracts', icon: ClipboardList },
            { name: 'Сдать отчет', href: '/report', icon: Send },
            { name: 'История', href: '/history', icon: Clock },
        ]
    },
    {
        title: "Финансы",
        items: [
            { name: 'Кошелек', href: '/wallet', icon: Wallet },
        ]
    }
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

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
      <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto custom-scrollbar">
        {menuItems.map((group) => (
            <div key={group.title}>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                    {group.title}
                </div>
                <div className="space-y-1">
                    {group.items.map((item) => {
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
                </div>
            </div>
        ))}
        
        {/* Admin Link */}
        {(session?.user?.role === 'ADMIN' || session?.user?.role === 'MODERATOR') && (
            <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                    Система
                </div>
                <Link
                    href="/admin"
                    className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                        pathname.startsWith('/admin')
                        ? "bg-[#e81c5a]/10 text-[#e81c5a]" 
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                >
                    <Users className={cn(
                        "w-5 h-5",
                        pathname.startsWith('/admin') ? "text-[#e81c5a]" : "text-gray-500 group-hover:text-white"
                    )} />
                    Админ панель
                </Link>
            </div>
        )}

        <div className="pt-2 px-3">
          <OnlineUsers />
        </div>
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-[#1f1f1f] bg-[#0a0a0a]">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
          <Link href="/profile" className="flex items-center gap-3 flex-1 min-w-0 group cursor-pointer">
            {session?.user?.image ? (
                <img 
                src={session.user.image} 
                alt={session.user.name || 'User'} 
                className="w-9 h-9 rounded-full border border-white/10 group-hover:border-white/30 transition-colors object-cover"
                />
            ) : (
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#e81c5a] to-purple-600 border border-white/10 group-hover:border-white/30 transition-colors" />
            )}
            
            <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-white truncate group-hover:text-[#e81c5a] transition-colors">
                    {session?.user?.name || 'User'}
                </span>
                <span className="text-xs text-gray-500 truncate">{session?.user?.role === 'ADMIN' ? 'Administrator' : 'Member'}</span>
            </div>
          </Link>
          
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="ml-auto p-1.5 rounded-md text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
            title="Выйти"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
