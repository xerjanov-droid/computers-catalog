"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import ruObj from '@/admin/locales/ru.json';
import uzObj from '@/admin/locales/uz.json';
import enObj from '@/admin/locales/en.json';

type AdminLanguage = 'ru' | 'uz' | 'en';

interface AdminLanguageContextType {
    language: AdminLanguage;
    setLanguage: (lang: AdminLanguage) => void;
    t: (key: string) => string;
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
        // Init from localStorage
        const stored = localStorage.getItem('admin_lang') as AdminLanguage;
        if (stored && ['ru', 'uz', 'en'].includes(stored)) {
            setLanguage(stored);
        }
    }, []);

    const handleSetLanguage = (lang: AdminLanguage) => {
        setLanguage(lang);
        localStorage.setItem('admin_lang', lang);
    };

    const t = (key: string): string => {
        const keys = key.split('.');
        let current: any = dictionaries[language];

        for (const k of keys) {
            if (current[k] === undefined) {
                // Fallback to key itself if missing
                return key;
            }
            current = current[k];
        }

        return typeof current === 'string' ? current : key;
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
