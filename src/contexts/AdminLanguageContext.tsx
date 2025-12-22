"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import ruObj from '@/admin/locales/ru.json';
import uzObj from '@/admin/locales/uz.json';
import enObj from '@/admin/locales/en.json';
import i18n from '@/lib/i18n';

type AdminLanguage = 'ru' | 'uz' | 'en';

interface AdminLanguageContextType {
    language: AdminLanguage;
    setLanguage: (lang: AdminLanguage) => void;
    t: (key: string, fallback?: string) => string;
}

const AdminLanguageContext = createContext<AdminLanguageContextType | undefined>(undefined);

const dictionaries = {
    ru: ruObj,
    uz: uzObj,
    en: enObj
};

export function AdminLanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<AdminLanguage>('ru');

    useEffect(() => {
        // Init from shared localStorage key first, then fallback to admin-specific key
        try {
            const shared = localStorage.getItem('active_lang') as AdminLanguage | null;
            if (shared && ['ru', 'uz', 'en'].includes(shared)) {
                setLanguage(shared);
                return;
            }
        } catch (e) {}

        try {
            const stored = localStorage.getItem('admin_lang') as AdminLanguage | null;
            if (stored && ['ru', 'uz', 'en'].includes(stored)) {
                setLanguage(stored);
            }
        } catch (e) {}
    }, []);

    const handleSetLanguage = (lang: AdminLanguage) => {
        setLanguage(lang);
        try {
            localStorage.setItem('admin_lang', lang);
            localStorage.setItem('active_lang', lang);
        } catch (e) {}
        // keep react-i18next in sync for shared UI parts
        try { i18n.changeLanguage(lang); } catch (e) {}
    };

    const t = (key: string, fallback?: string): string => {
        const keys = key.split('.');
        let current: any = dictionaries[language];

        for (const k of keys) {
            if (current[k] === undefined) {
                // Fallback to provided fallback, or key itself
                return fallback ?? key;
            }
            current = current[k];
        }

        return typeof current === 'string' ? current : (fallback ?? key);
    };

    return (
        <AdminLanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </AdminLanguageContext.Provider>
    );
}

export function useAdminLanguage() {
    const context = useContext(AdminLanguageContext);
    if (!context) {
        throw new Error('useAdminLanguage must be used within an AdminLanguageProvider');
    }
    return context;
}
