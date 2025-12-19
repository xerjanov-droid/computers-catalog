'use client';

import { ChevronLeft, Heart, Share2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// import { toast } from 'sonner'; // Removed unused dependency

interface ProductHeaderProps {
    title: string;
    brand: string;
    model: string;
}

export function ProductHeader({ title, brand, model }: ProductHeaderProps) {
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
        <div className="sticky top-0 z-10 bg-[var(--tg-theme-bg-color)]/80 backdrop-blur-md p-4 flex justify-between items-center transition-all">
            <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-[var(--tg-theme-secondary-bg-color)]">
                <ChevronLeft className="w-6 h-6 text-[var(--tg-theme-text-color)]" />
            </Link>

            <span className="font-semibold truncate max-w-[200px] text-[var(--tg-theme-text-color)]">
                {brand} {model}
            </span>

            <div className="flex gap-1 -mr-2">
                <button
                    onClick={handleShare}
                    className="p-2 rounded-full hover:bg-[var(--tg-theme-secondary-bg-color)] text-[var(--tg-theme-link-color)]"
                >
                    <Share2 className="w-6 h-6" />
                </button>
                <button className="p-2 rounded-full hover:bg-[var(--tg-theme-secondary-bg-color)]">
                    <Heart className="w-6 h-6 text-[var(--tg-theme-hint-color)]" />
                </button>
            </div>
        </div>
    );
}
