"use client";

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ArrowUpDown } from 'lucide-react';
import { useState } from 'react';

type SortOption = 'popular' | 'newest' | 'price_asc' | 'price_desc' | 'stock' | 'name_asc';

interface SortOptionConfig {
    value: SortOption;
    labelKey: string;
}

const SORT_OPTIONS: SortOptionConfig[] = [
    { value: 'popular', labelKey: 'sort.popular' },
    { value: 'newest', labelKey: 'sort.newest' },
    { value: 'price_asc', labelKey: 'sort.price_low_to_high' },
    { value: 'price_desc', labelKey: 'sort.price_high_to_low' },
    { value: 'stock', labelKey: 'sort.in_stock_first' },
    { value: 'name_asc', labelKey: 'sort.name_a_z' },
];

export function SortSelector() {
    const { t } = useTranslation('common');
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);

    const currentSort = (searchParams.get('sort') as SortOption) || 'popular';

    const handleSortChange = (sort: SortOption) => {
        const params = new URLSearchParams(searchParams.toString());
        
        if (sort === 'popular') {
            params.delete('sort'); // Default sort
        } else {
            params.set('sort', sort);
        }
        
        router.push(`${pathname}?${params.toString()}`);
        setIsOpen(false);
    };

    const currentLabel = SORT_OPTIONS.find(opt => opt.value === currentSort)?.labelKey || 'sort.popular';

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-[var(--tg-theme-hint-color)]/30 shadow-sm rounded-xl text-sm font-medium active:scale-95 transition-transform"
            >
                <ArrowUpDown className="w-4 h-4 text-[var(--tg-theme-button-color)]" />
                <span className="text-[var(--tg-theme-text-color)]">{t(currentLabel)}</span>
            </button>

            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-20 min-w-[200px] overflow-hidden">
                        {SORT_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleSortChange(option.value)}
                                className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                                    currentSort === option.value
                                        ? 'bg-[var(--tg-theme-button-color)]/10 text-[var(--tg-theme-button-color)] font-medium'
                                        : 'text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                {t(option.labelKey)}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

