'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';

export function SearchBar() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const { t } = useTranslation();
    const [term, setTerm] = useState(searchParams.get('search')?.toString() || '');

    const handleSearch = useCallback((value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set('search', value);
        } else {
            params.delete('search');
        }
        replace(`${pathname}?${params.toString()}`);
    }, [searchParams, pathname, replace]);

    return (
        <div className="sticky top-0 z-20 bg-[var(--tg-theme-bg-color)] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex items-center gap-3">
            <div className="relative flex-1">
                <input
                    className="w-full bg-[#f0f2f5] text-black pl-11 pr-4 py-3 rounded-2xl border border-transparent focus:bg-white focus:border-[var(--tg-theme-button-color)]/30 focus:shadow-lg outline-none transition-all placeholder-gray-500 font-medium text-[15px]"
                    placeholder={t('search_placeholder')}
                    defaultValue={searchParams.get('search')?.toString()}
                    onChange={(e) => {
                        // Simple debounce imitation or direct call for now.
                        // Using timeout to avoid excessive re-renders/fetches
                        const val = e.target.value;
                        setTerm(val);
                        setTimeout(() => handleSearch(val), 500);
                    }}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
            </div>
            <LanguageSwitcher />
        </div>
    );
}
