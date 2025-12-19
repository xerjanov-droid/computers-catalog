
"use client";

import { useAdminLanguage } from '@/contexts/AdminLanguageContext';

export function AdminHeader() {
    const { language, setLanguage } = useAdminLanguage();

    const languages = [
        { code: 'uz', label: 'UZ' },
        { code: 'ru', label: 'RU' },
        { code: 'en', label: 'EN' },
    ];

    return (
        <header className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-10">
            <div className="text-sm text-gray-500">
                {/* Breadcrumbs or greeting could go here */}
            </div>

            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => setLanguage(lang.code as any)}
                        className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${language === lang.code
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {lang.label}
                    </button>
                ))}
            </div>
        </header>
    );
}
