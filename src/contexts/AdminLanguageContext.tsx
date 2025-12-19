
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type AdminLanguage = 'ru' | 'uz' | 'en';

interface AdminLanguageContextType {
    language: AdminLanguage;
    setLanguage: (lang: AdminLanguage) => void;
    t: (key: string) => string; // Simple translator placeholder or link to i18next
}

const AdminLanguageContext = createContext<AdminLanguageContextType | undefined>(undefined);

export function AdminLanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<AdminLanguage>('ru');

    useEffect(() => {
        const stored = localStorage.getItem('admin_lang') as AdminLanguage;
        if (stored && ['ru', 'uz', 'en'].includes(stored)) {
            setLanguage(stored);
        }
    }, []);

    const handleSetLanguage = (lang: AdminLanguage) => {
        setLanguage(lang);
        localStorage.setItem('admin_lang', lang);
        // Could also trigger a reload if needed, but Context Reactivity is better
    };

    // Simple dictionary for Admin UI (can be expanded or replaced with i18next)
    // For now, hardcoding based on TT:
    const dictionary: Record<string, Record<AdminLanguage, string>> = {
        'nav.dashboard': { ru: 'Дашборд', uz: 'Boshqaruv paneli', en: 'Dashboard' },
        'nav.products': { ru: 'Продукты', uz: 'Mahsulotlar', en: 'Products' },
        'nav.categories': { ru: 'Категории', uz: 'Kategoriyalar', en: 'Categories' },
        'categories.title': { ru: 'Категории', uz: 'Kategoriyalar', en: 'Categories' },
        'categories.name': { ru: 'Название', uz: 'Nomi', en: 'Name' },
        'categories.slug': { ru: 'Slug', uz: 'Slug', en: 'Slug' },
        'categories.active': { ru: 'Активен', uz: 'Faol', en: 'Active' },
        'categories.actions': { ru: 'Действия', uz: 'Amallar', en: 'Actions' },
        // Add more as needed
    };

    const t = (key: string) => {
        return dictionary[key]?.[language] || key;
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
