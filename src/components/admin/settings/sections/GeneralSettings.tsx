'use client';

import { Setting } from '@/services/settings.service';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';

interface Props {
    settings: Setting[];
    onUpdate: (category: string, key: string, value: any) => void;
}

export function GeneralSettings({ settings, onUpdate }: Props) {
    const { t } = useAdminLanguage();
    const getSetting = (key: string) => settings.find(s => s.key === key);
    const getValue = (key: string, defaultValue: any = '') => {
        const setting = getSetting(key);
        if (!setting) return defaultValue;
        // SettingsService already parses JSONB values correctly
        // Just return the value as is
        return setting.value ?? defaultValue;
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">1️⃣ {t('settings.sections.general.title')}</h2>
                <p className="text-gray-600 mb-6">{t('settings.sections.general.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('settings.sections.general.project_name')}
                    </label>
                    <input
                        type="text"
                        value={getValue('project_name', 'Computers Catalog')}
                        onChange={(e) => onUpdate('general', 'project_name', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('settings.sections.general.default_language')}
                    </label>
                    <select
                        value={getValue('default_language', 'uz')}
                        onChange={(e) => onUpdate('general', 'default_language', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="uz">UZ</option>
                        <option value="ru">RU</option>
                        <option value="en">EN</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('settings.sections.general.default_currency')}
                    </label>
                    <select
                        value={getValue('default_currency', 'UZS')}
                        onChange={(e) => onUpdate('general', 'default_currency', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="UZS">UZS</option>
                        <option value="USD">USD</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('settings.sections.general.date_format')}
                    </label>
                    <input
                        type="text"
                        value={getValue('date_format', 'DD.MM.YYYY')}
                        onChange={(e) => onUpdate('general', 'date_format', e.target.value)}
                        placeholder="DD.MM.YYYY"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('settings.sections.general.time_format')}
                    </label>
                    <input
                        type="text"
                        value={getValue('time_format', 'HH:mm')}
                        onChange={(e) => onUpdate('general', 'time_format', e.target.value)}
                        placeholder="HH:mm"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                    </label>
                    <input
                        type="text"
                        value={getValue('timezone', 'Asia/Tashkent')}
                        onChange={(e) => onUpdate('general', 'timezone', e.target.value)}
                        placeholder="Asia/Tashkent"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>
        </div>
    );
}

