import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface WelcomeBannerProps {
    displayName: string;
}

export function WelcomeBanner({ displayName }: WelcomeBannerProps) {
    return (
        <div className="flex flex-col md:flex-row items-end justify-between gap-4">
            <div>
                <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Добро пожаловать, <span className="text-[#e81c5a]">{displayName}</span></h1>
                <p className="text-gray-400">Сегодня отличный день для ведения бизнеса.</p>
            </div>
            <div className="flex gap-3">
                <Link href="/contracts">
                    <Button className="bg-[#e81c5a] hover:bg-[#c21548] text-white shadow-[0_0_20px_rgba(232,28,90,0.3)]">
                        Взять контракт
                    </Button>
                </Link>
            </div>
        </div>
    );
}
