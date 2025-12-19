'use client';

import { useTranslation } from 'react-i18next';

interface TranslatedTextProps {
    i18nKey: string;
    fallback?: string;
}

export function TranslatedText({ i18nKey, fallback }: TranslatedTextProps) {
    const { t } = useTranslation();
    // Use fallback if provided, otherwise letting i18n handle it or returning key
    return <>{t(i18nKey, { defaultValue: fallback })}</>;
}
