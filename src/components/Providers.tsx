'use client';

import '@/lib/i18n'; // Init i18n
import i18n from '@/lib/i18n';
import { useEffect } from 'react';

// Declare global Telegram type if not already declared in types/index.ts or global.d.ts
// Re-declaring for safety here locally if needed, or relying on ambient
// Types are now in src/types/telegram.d.ts

export function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // 1) If user previously selected a language, restore it from shared storage
        try {
            const stored = localStorage.getItem('active_lang');
            if (stored && ['ru', 'en', 'uz'].includes(stored)) {
                i18n.changeLanguage(stored);
                return;
            }
        } catch (e) {
            // ignore localStorage errors
        }

        // 2) Fallback to Telegram-detected language if available
        const tgLang = window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
        if (tgLang && ['ru', 'en', 'uz'].includes(tgLang)) {
            try { localStorage.setItem('active_lang', tgLang); } catch {}
            i18n.changeLanguage(tgLang);
        }
    }, []);

    return (
        <>
            {children}
        </>
    );
}
