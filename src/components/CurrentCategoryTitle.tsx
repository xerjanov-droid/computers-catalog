'use client';

import { useTranslation } from 'react-i18next';
import { Category } from '@/types';

interface CurrentCategoryTitleProps {
    category?: Category;
    Fallback?: React.ReactNode;
}

export function CurrentCategoryTitle({ category }: CurrentCategoryTitleProps) {
    const { t, i18n } = useTranslation();

    if (!category) {
        return <>{t('popular')}</>;
    }

    const lang = i18n.language as 'ru' | 'uz' | 'en';
    const name = category[`name_${lang}`] || category.name_ru;

    return <>{name}</>;
}
