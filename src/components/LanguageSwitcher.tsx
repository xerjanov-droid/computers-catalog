'use client';

import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const router = useRouter();

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
        
        // Use query parameter to ensure language change is reflected immediately
        // This works better than router.refresh() which may not wait for cookie
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('lang', lng);
        
        // Small delay to ensure cookie is set before reload
        setTimeout(() => {
            // Reload the page to re-fetch server-side data with new language
            window.location.href = currentUrl.toString();
        }, 50);
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
