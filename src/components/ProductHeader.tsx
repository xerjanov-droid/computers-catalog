'use client';

import { ChevronLeft, Heart, Share2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AvailabilityBadge } from './AvailabilityBadge';
// import { toast } from 'sonner'; // Removed unused dependency

interface ProductHeaderProps {
    title: string;
    brand: string;
    model: string;
    status: string;
}

export function ProductHeader({ title, brand, model, status }: ProductHeaderProps) {
    const router = useRouter();

    const handleShare = () => {
        if (typeof window !== 'undefined') {
            const url = window.location.href;
            if (navigator.share) {
                navigator.share({
                    title: `${brand} ${model}`,
                    text: title,
                    url: url
                }).catch(console.error);
            } else {
                navigator.clipboard.writeText(url);
                // Simple feedback
                if (window.Telegram?.WebApp) {
                    window.Telegram.WebApp.showAlert('Ссылка скопирована!');
                } else {
                    alert('Link copied!');
                }
            }
        }
    };

    return (
        <div className="sticky top-0 z-50 bg-[var(--tg-theme-bg-color)]/95 backdrop-blur-md border-b border-[var(--tg-theme-hint-color)]/5 shadow-sm px-4 py-3 flex justify-between items-center transition-all h-[60px]">
            <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-[var(--tg-theme-secondary-bg-color)] transition-colors">
                <ChevronLeft className="w-6 h-6 text-[var(--tg-theme-text-color)]" />
            </button>

            <div className="flex-1 mx-4 text-center">
                <h1 className="font-bold text-sm leading-tight line-clamp-2 text-[var(--tg-theme-text-color)]">
                    {brand} {model}
                </h1>
            </div>

            <div className="flex gap-2 -mr-2">
                <button
                    onClick={handleShare}
                    className="p-2 rounded-full active:bg-[var(--tg-theme-secondary-bg-color)] text-[var(--tg-theme-link-color)] transition-colors"
                >
                    <Share2 className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-full active:bg-[var(--tg-theme-secondary-bg-color)] transition-colors">
                    <Heart className="w-5 h-5 text-[var(--tg-theme-hint-color)]" />
                </button>
            </div>
        </div>
    );
}
