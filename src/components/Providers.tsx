'use client';

import '@/lib/i18n'; // Init i18n
import i18n from '@/lib/i18n';
import { useEffect } from 'react';

// Declare global Telegram type if not already declared in types/index.ts or global.d.ts
// Re-declaring for safety here locally if needed, or relying on ambient
// Types are now in src/types/telegram.d.ts

export function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Detect Telegram language
        if (typeof window !== 'undefined') {
            const tgLang = window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
            if (tgLang && ['ru', 'en', 'uz'].includes(tgLang)) {
                i18n.changeLanguage(tgLang);
            }
        }
    }, []);

    return (
        <>
            {children}
        </>
    );
}
