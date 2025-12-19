'use client';

import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => changeLanguage('uz')}
                className={`px-2 py-1 text-xs rounded border ${i18n.language === 'uz' ? 'bg-blue-500 text-white border-blue-600' : 'bg-white text-gray-700'}`}
            >
                UZ
            </button>
            <button
                onClick={() => changeLanguage('ru')}
                className={`px-2 py-1 text-xs rounded border ${i18n.language === 'ru' ? 'bg-blue-500 text-white border-blue-600' : 'bg-white text-gray-700'}`}
            >
                RU
            </button>
            <button
                onClick={() => changeLanguage('en')}
                className={`px-2 py-1 text-xs rounded border ${i18n.language === 'en' ? 'bg-blue-500 text-white border-blue-600' : 'bg-white text-gray-700'}`}
            >
                EN
            </button>
        </div>
    );
}
