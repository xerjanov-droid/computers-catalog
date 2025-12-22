'use client';

import { Category } from '@/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

interface CategorySliderProps {
    categories: Category[];
}

export function CategorySlider({ categories }: CategorySliderProps) {
    const searchParams = useSearchParams();
    const activeId = searchParams.get('category');
    const { t, i18n } = useTranslation();

    const getCategoryName = (cat: Category) => {
        const lang = i18n.language as 'ru' | 'uz' | 'en';
        if (lang === 'uz') return cat.name_uz || cat.name_ru;
        if (lang === 'en') return cat.name_en || cat.name_ru;
        return cat.name_ru;
    };

    return (
        <div className="w-full overflow-x-auto pb-4 pt-2 no-scrollbar">
            <div className="flex gap-4 px-4 min-w-max">
                <Link
                    href="/"
                    className={cn(
                        "flex flex-col items-center gap-2 p-2 rounded-2xl transition-all min-w-[72px]",
                        !activeId
                            ? "bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] scale-105 border border-[var(--tg-theme-hint-color)]/20"
                            : "opacity-70 grayscale-[0.5]"
                    )}
                >
                    <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-sm",
                        !activeId ? "bg-[var(--tg-theme-secondary-bg-color)]" : "bg-white"
                    )}>
                        🏠
                    </div>
                    <span className={cn(
                        "text-[11px] font-bold whitespace-nowrap leading-none pb-1",
                        !activeId ? "text-[var(--tg-theme-text-color)]" : "text-[var(--tg-theme-hint-color)]"
                    )}>{t('all')}</span>
                </Link>

                {categories.map((cat) => (
                    <Link
                        key={cat.id}
                        href={`/?category=${cat.id}`}
                        className={cn(
                            "flex flex-col items-center gap-2 p-2 rounded-2xl transition-all min-w-[72px]",
                            activeId === String(cat.id)
                                ? "bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] scale-105 border border-[var(--tg-theme-hint-color)]/20"
                                : "opacity-70 grayscale-[0.5]"
                        )}
                    >
                        {/* Placeholder for Icon */}
                        <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-sm",
                            activeId === String(cat.id) ? "bg-[var(--tg-theme-secondary-bg-color)]" : "bg-white"
                        )}>
                            {cat.icon ? (
                                    <img src={cat.icon} alt={getCategoryName(cat)} className="w-7 h-7 object-contain" />
                                ) : (
                                    (getCategoryName(cat) || '?')[0]
                                )}
                        </div>
                        <span className={cn(
                            "text-[11px] font-bold whitespace-nowrap leading-none pb-1",
                            activeId === String(cat.id) ? "text-[var(--tg-theme-text-color)]" : "text-[var(--tg-theme-hint-color)]"
                        )}>
                            {getCategoryName(cat)}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
