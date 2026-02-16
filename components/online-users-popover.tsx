'use client';

import { OnlineUsers } from '@/components/online-users';
import { cn } from '@/lib/utils';
import { Users, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function OnlineUsersPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="fixed top-4 right-4 z-50" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full border shadow-lg transition-all duration-300 backdrop-blur-md",
            isOpen 
                ? "bg-[#e81c5a] border-[#e81c5a] text-white" 
                : "bg-black/50 border-white/10 text-gray-300 hover:text-white hover:bg-black/70 hover:border-white/20"
        )}
      >
        <Users className="w-5 h-5" />
        <span className="text-sm font-bold hidden sm:inline">Онлайн</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-14 w-80 bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-200">
             <div className="flex items-center justify-between mb-4 border-b border-[#1f1f1f] pb-2">
                <h3 className="font-bold text-white">Сейчас онлайн</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                </button>
             </div>
             <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                <OnlineUsers />
             </div>
        </div>
      )}
    </div>
  );
}
