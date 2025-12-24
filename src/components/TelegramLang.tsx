'use client';

import { useEffect, useState } from 'react';

export function TelegramLang() {
    const [lang, setLang] = useState<'uz' | 'ru' | 'en'>('uz');

    useEffect(() => {
        // Faqat brauzerda ishlaydi
        if (typeof window === 'undefined') return;

        // Telegram bo'lmasa — jim
        if (!window.Telegram || !window.Telegram.WebApp) return;

        const user = window.Telegram.WebApp.initDataUnsafe?.user;

        if (user && typeof user.language_code === 'string') {
            const code = user.language_code.toLowerCase();

            if (code.startsWith('ru')) setLang('ru');
            else if (code.startsWith('en')) setLang('en');
            else setLang('uz');
        }
    }, []);

    return (
        <div
            style={{
                position: 'fixed',
                bottom: 70,
                right: 12,
                padding: '6px 10px',
                fontSize: 12,
                borderRadius: 8,
                background: 'var(--tg-theme-bg-color)',
                color: 'var(--tg-theme-text-color)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                zIndex: 9999,
            }}
        >
            TG lang: <b>{lang}</b>
        </div>
    );
}
