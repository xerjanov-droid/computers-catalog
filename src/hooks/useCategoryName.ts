'use client';

import { useTranslation } from 'react-i18next';
import { Category } from '@/types';
import { getCategoryName, SupportedLanguage } from '@/utils/category.utils';

/**
 * Hook to get category name in the current user's language
 * Automatically updates when language changes
 */
export function useCategoryName() {
    const { i18n } = useTranslation();
    const currentLang = (i18n.language as SupportedLanguage) || 'uz';

    return (category: Category | null | undefined): string => {
        return getCategoryName(category, currentLang);
    };
}

