'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ClipboardList, Home, Menu, PenTool, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { name: 'Главная', href: '/', icon: Home },
  { name: 'Контракты', href: '/contracts', icon: ClipboardList },
  { name: 'Отчеты', href: '/report', icon: PenTool },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 text-white font-bold text-xl tracking-widest uppercase flex items-center gap-2 group">
                <span className="bg-[#e81c5a] w-1 h-6 block group-hover:h-4 transition-all duration-300" />
                SHELBY
              </Link>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                    >
                      <Button 
                          variant={isActive ? "secondary" : "ghost"} 
                          className={cn(
                              "gap-2 transition-all duration-300 rounded-lg", 
                              isActive && "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]",
                              !isActive && "text-gray-400 hover:text-white"
                          )}
                          size="sm"
                      >
                          <item.icon className="w-3.5 h-3.5" />
                          <span>{item.name}</span>
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="block h-5 w-5" /> : <Menu className="block h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden border-t border-white/5 animate-in slide-in-from-top-2">
            <div className="px-4 pt-4 pb-6 space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="block"
                  >
                     <Button 
                          variant={isActive ? "secondary" : "ghost"} 
                          className="w-full justify-start gap-3"
                      >
                          <item.icon className="w-4 h-4" />
                          <span>{item.name}</span>
                      </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>
      {/* Spacer to prevent content from being hidden behind navbar */}
      <div className="h-28" />
    </>
  );
}
