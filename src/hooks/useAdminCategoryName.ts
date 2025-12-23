'use client';

import { Category } from '@/types';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { getCategoryName, SupportedLanguage } from '@/utils/category.utils';

/**
 * Hook to get category name in the current admin panel language
 * Uses AdminLanguageContext instead of i18n
 */
export function useAdminCategoryName() {
    const { language } = useAdminLanguage();
    const currentLang = (language as SupportedLanguage) || 'ru';

    return (category: Category | null | undefined): string => {
        return getCategoryName(category, currentLang);
    };
}

