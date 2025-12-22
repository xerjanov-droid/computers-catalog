'use client';

import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        // persist shared active language so all parts of the app can read it
        try {
            localStorage.setItem('active_lang', lng);
        } catch (e) {
            // ignore localStorage errors in restricted environments
        }
        try {
            // also set a cookie so server-side rendering can read the selected language
            document.cookie = `active_lang=${lng}; path=/; max-age=${60 * 60 * 24 * 365}`;
        } catch (e) {}
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
