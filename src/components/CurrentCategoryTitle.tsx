'use client';

import { useTranslation } from 'react-i18next';
import { Category } from '@/types';

interface CurrentCategoryTitleProps {
    category?: Category;
    Fallback?: React.ReactNode;
    displayName?: string | null;
}

export function CurrentCategoryTitle({ category, displayName }: CurrentCategoryTitleProps) {
    const { t, i18n } = useTranslation();

    if (!category) {
        return <>{t('popular')}</>;
    }

    if (displayName) {
        return <>{displayName}</>;
    }

    const lang = i18n.language as 'ru' | 'uz' | 'en';
    const name = (category as any)[`name_${lang}`] || category.name_ru;

    return <>{name}</>;
}
