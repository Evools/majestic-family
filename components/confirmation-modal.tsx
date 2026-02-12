'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'success' | 'warning';
    loading?: boolean;
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Подтвердить',
    cancelText = 'Отмена',
    variant = 'warning',
    loading = false
}: ConfirmationModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible) return null;

    const getIcon = () => {
        switch (variant) {
            case 'success': return <CheckCircle2 className="w-12 h-12 text-green-500" />;
            case 'danger': return <AlertTriangle className="w-12 h-12 text-red-500" />;
            default: return <AlertTriangle className="w-12 h-12 text-yellow-500" />;
        }
    };

    const getButtonColor = () => {
        switch (variant) {
            case 'success': return "bg-green-600 hover:bg-green-700 shadow-green-600/20";
            case 'danger': return "bg-red-600 hover:bg-red-700 shadow-red-600/20";
            default: return "bg-yellow-600 hover:bg-yellow-700 shadow-yellow-600/20 text-white";
        }
    };

    return (
        <div 
            className={cn(
                "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-300",
                isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
        >
            <div 
                className={cn(
                    "relative w-full max-w-sm transition-all duration-300 transform",
                    isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
                )}
            >
                <Card className="bg-[#0a0a0a] border-white/10 overflow-hidden shadow-2xl">
                    <button 
                        onClick={onClose}
                        className="absolute right-4 top-4 text-gray-500 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="p-8 flex flex-col items-center text-center">
                        <div className="mb-6 p-4 rounded-full bg-white/5 border border-white/10 shadow-inner">
                            {getIcon()}
                        </div>

                        <h2 className="text-xl font-black text-white tracking-tight mb-2">
                            {title}
                        </h2>
                        
                        <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                            {description}
                        </p>

                        <div className="flex gap-3 w-full">
                            <Button 
                                variant="ghost" 
                                onClick={onClose}
                                disabled={loading}
                                className="flex-1 border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white"
                            >
                                {cancelText}
                            </Button>
                            <Button 
                                onClick={onConfirm}
                                disabled={loading}
                                className={cn("flex-1 shadow-lg font-bold", getButtonColor())}
                            >
                                {loading ? '...' : confirmText}
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
