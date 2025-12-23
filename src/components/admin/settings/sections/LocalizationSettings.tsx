'use client';

import { Setting } from '@/services/settings.service';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';

interface Props {
    settings: Setting[];
    onUpdate: (category: string, key: string, value: any) => void;
}

export function LocalizationSettings({ settings, onUpdate }: Props) {
    const { t } = useAdminLanguage();
    const getSetting = (key: string) => settings.find(s => s.key === key);
    const getValue = (key: string, defaultValue: any = '') => {
        const setting = getSetting(key);
        return setting?.value ?? defaultValue;
    };

    const activeLanguages = getValue('active_languages', ['uz', 'ru', 'en']);
    const isLanguageActive = (lang: string) => Array.isArray(activeLanguages) && activeLanguages.includes(lang);

    const toggleLanguage = (lang: string) => {
        const current = Array.isArray(activeLanguages) ? [...activeLanguages] : [];
        const newLanguages = current.includes(lang)
            ? current.filter(l => l !== lang)
            : [...current, lang];
        onUpdate('localization', 'active_languages', newLanguages);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">2️⃣ {t('settings.sections.localization.title')}</h2>
                <p className="text-gray-600 mb-6">{t('settings.sections.localization.subtitle')}</p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        {t('settings.sections.localization.active_languages')}
                    </label>
                    <div className="flex gap-4">
                        {['uz', 'ru', 'en'].map(lang => (
                            <label key={lang} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isLanguageActive(lang)}
                                    onChange={() => toggleLanguage(lang)}
                                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="font-medium">{lang.toUpperCase()}</span>
                            </label>
                        ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {t('settings.sections.localization.warning')}
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('settings.sections.localization.default_language')}
                    </label>
                    <select
                        value={getValue('default_language', 'uz')}
                        onChange={(e) => onUpdate('localization', 'default_language', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="uz">UZ</option>
                        <option value="ru">RU</option>
                        <option value="en">EN</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('settings.sections.localization.fallback_language')}
                    </label>
                    <select
                        value={getValue('fallback_language', 'en')}
                        onChange={(e) => onUpdate('localization', 'fallback_language', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="uz">UZ</option>
                        <option value="ru">RU</option>
                        <option value="en">EN</option>
                    </select>
                    <p className="text-sm text-gray-500 mt-2">
                        {t('settings.sections.localization.fallback_hint')}
                    </p>
                </div>
            </div>
        </div>
    );
}

