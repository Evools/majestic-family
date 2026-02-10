'use client';

import { cn } from '@/lib/utils';
import { Check, ChevronDown } from 'lucide-react';
import * as React from 'react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  className
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg border bg-[#0a0a0a] transition-all duration-200 outline-none",
          isOpen ? "border-[#e81c5a] ring-1 ring-[#e81c5a]/50" : "border-[#1f1f1f] hover:border-gray-700",
          !selectedOption && "text-gray-500"
        )}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={cn("w-4 h-4 text-gray-500 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[#1a1a1a] border border-[#2f2f2f] rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="max-h-60 overflow-auto py-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "w-full flex items-center px-3 py-2 text-sm text-left transition-colors",
                  option.value === value 
                    ? "bg-[#e81c5a]/10 text-[#e81c5a]" 
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                )}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                <span className="flex-1 truncate">{option.label}</span>
                {option.value === value && <Check className="w-4 h-4 ml-2" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
