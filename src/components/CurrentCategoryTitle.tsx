'use client';

import { useTranslation } from 'react-i18next';
import { Category } from '@/types';

interface CurrentCategoryTitleProps {
    category?: Category;
    Fallback?: React.ReactNode;
    displayName?: string | null;
}

export function CurrentCategoryTitle({ category, displayName }: CurrentCategoryTitleProps) {
    const { t } = useTranslation();

    if (!category) {
        return <>{t('popular')}</>;
    }

    // Golden Rule: UI only uses 'name' field from server (or displayName if provided)
    const name = displayName || category.name || '';

    return <>{name}</>;
}
