"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Filter as FilterIcon } from 'lucide-react';
import Filters from "@/components/Filters";

interface FilterWrapperProps {
    categorySlug?: string;
}

export function FilterWrapper({ categorySlug }: FilterWrapperProps) {
    const { t } = useTranslation("common");
    const [isOpen, setIsOpen] = useState(false);

    // Fallback if no category is present
    const category = categorySlug || 'printers'; // Default to printers filters if unclear? Or empty?
    // TZ implies CATEGORY_FILTERS_MAP has keys like 'printers'.
    // If we are on root page with no category selected, maybe show nothing or generic?
    // For now passing keys even if they might be empty in config for '', handled by config fallback.

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-[var(--tg-theme-hint-color)]/30 shadow-sm rounded-xl text-sm font-bold active:scale-95 transition-transform"
            >
                <FilterIcon className="w-4 h-4 text-[var(--tg-theme-button-color)]" />
                {t('filters.title')}
            </button>

            {isOpen && (
                <Filters
                    category={category}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
