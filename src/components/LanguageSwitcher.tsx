'use client';

import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import { useState, useEffect } from 'react';

export function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const router = useRouter();
    const [currentLang, setCurrentLang] = useState<string>('uz');

    // Initialize and sync with i18n and localStorage
    useEffect(() => {
        // Get language from localStorage first, then i18n
        const getCurrentLanguage = () => {
            try {
                const stored = localStorage.getItem('active_lang');
                if (stored && ['uz', 'ru', 'en'].includes(stored)) {
                    // Ensure i18n is in sync
                    if (i18n.language !== stored) {
                        i18n.changeLanguage(stored);
                    }
                    return stored;
                }
            } catch (e) {}
            
            // Fallback to i18n language or default
            const lang = i18n.language || 'uz';
            // Normalize language code (i18n might return 'uz-UZ' or similar)
            const normalizedLang = lang.split('-')[0];
            if (['uz', 'ru', 'en'].includes(normalizedLang)) {
                return normalizedLang;
            }
            return 'uz';
        };

        // Wait for i18n to be initialized
        if (i18n.isInitialized) {
            setCurrentLang(getCurrentLanguage());
        } else {
            i18n.on('initialized', () => {
                setCurrentLang(getCurrentLanguage());
            });
        }

        // Listen for language changes in i18n
        const handleLanguageChange = (lng: string) => {
            const normalizedLang = lng.split('-')[0];
            if (['uz', 'ru', 'en'].includes(normalizedLang)) {
                setCurrentLang(normalizedLang);
            }
        };

        i18n.on('languageChanged', handleLanguageChange);

        return () => {
            i18n.off('languageChanged', handleLanguageChange);
            i18n.off('initialized', getCurrentLanguage);
        };
    }, [i18n]);

    const changeLanguage = (lng: string) => {
        // Update state immediately for visual feedback
        setCurrentLang(lng);
        
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
                className={`px-2 py-1 text-xs rounded border ${currentLang === 'uz' ? 'bg-blue-500 text-white border-blue-600' : 'bg-white text-gray-700'}`}
            >
                UZ
            </button>
            <button
                onClick={() => changeLanguage('ru')}
                className={`px-2 py-1 text-xs rounded border ${currentLang === 'ru' ? 'bg-blue-500 text-white border-blue-600' : 'bg-white text-gray-700'}`}
            >
                RU
            </button>
            <button
                onClick={() => changeLanguage('en')}
                className={`px-2 py-1 text-xs rounded border ${currentLang === 'en' ? 'bg-blue-500 text-white border-blue-600' : 'bg-white text-gray-700'}`}
            >
                EN
            </button>
        </div>
    );
}
