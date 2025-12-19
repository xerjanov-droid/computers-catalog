"use client";

import { useAdminLanguage } from "@/contexts/AdminLanguageContext";

export function AdminLanguageSwitcher() {
    const { language, setLanguage } = useAdminLanguage();

    const langs = [
        { code: 'uz', label: 'UZ' },
        { code: 'ru', label: 'RU' },
        { code: 'en', label: 'EN' }
    ];

    return (
        <div className="flex bg-gray-100 p-1 rounded-lg">
            {langs.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as any)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${language === lang.code
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    {lang.label}
                </button>
            ))}
        </div>
    );
}
