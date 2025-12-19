'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export function Filters() {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);

    // Parse current state
    const currentTech = searchParams.get('technology');
    const currentLocation = searchParams.get('status');

    const updateFilter = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.replace(`/?${params.toString()}`);
    };

    return (
        <>
            {/* Trigger */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-[var(--tg-theme-hint-color)]/30 shadow-sm rounded-xl text-sm font-bold active:scale-95 transition-transform"
            >
                <Filter className="w-4 h-4 text-[var(--tg-theme-button-color)]" />
                {t('filters')}
            </button>

            {/* Modal / Sheet */}
            {isOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="bg-[var(--tg-theme-bg-color)] w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl animate-slide-up">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold">{t('filters')}</h3>
                            <button onClick={() => setIsOpen(false)}><X className="w-6 h-6" /></button>
                        </div>

                        <div className="space-y-6">
                            {/* Technology */}
                            <div>
                                <h4 className="text-sm font-medium mb-3 text-[var(--tg-theme-hint-color)]">Технология</h4>
                                <div className="flex gap-2">
                                    {['laser', 'inkjet'].map((tech) => (
                                        <button
                                            key={tech}
                                            onClick={() => updateFilter('technology', currentTech === tech ? null : tech)}
                                            className={cn(
                                                "px-4 py-2 rounded-lg text-sm border",
                                                currentTech === tech
                                                    ? "bg-[var(--tg-theme-button-color)] text-white border-transparent"
                                                    : "bg-transparent border-[var(--tg-theme-hint-color)]/20"
                                            )}
                                        >
                                            {tech === 'laser' ? 'Лазерный' : 'Струйный'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full py-3 bg-[var(--tg-theme-button-color)] text-white rounded-xl font-semibold mt-4"
                            >
                                Показать результаты
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
