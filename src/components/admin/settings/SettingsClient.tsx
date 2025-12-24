'use client';

import { useState } from 'react';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { Settings, Save, RefreshCw, AlertCircle } from 'lucide-react';
import { Setting } from '@/services/settings.service';
import { GeneralSettings } from './sections/GeneralSettings';
import { LocalizationSettings } from './sections/LocalizationSettings';
import { CatalogSettings } from './sections/CatalogSettings';
import { FiltersSettings } from './sections/FiltersSettings';
import { OrdersSettings } from './sections/OrdersSettings';
import { SecuritySettings } from './sections/SecuritySettings';
import { SystemSettings } from './sections/SystemSettings';

interface Props {
    initialSettings: Record<string, Setting[]>;
}

export function SettingsClient({ initialSettings }: Props) {
    const { t } = useAdminLanguage();
    const [settings, setSettings] = useState<Record<string, Setting[]>>(initialSettings);
    const [activeTab, setActiveTab] = useState<string>('general');
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const tabs = [
        { id: 'general', label: t('settings.tabs.general'), icon: Settings },
        { id: 'localization', label: t('settings.tabs.localization'), icon: Settings },
        { id: 'catalog', label: t('settings.tabs.catalog'), icon: Settings },
        { id: 'filters', label: t('settings.tabs.filters'), icon: Settings },
        { id: 'orders', label: t('settings.tabs.orders'), icon: Settings },
        { id: 'security', label: t('settings.tabs.security'), icon: Settings },
        { id: 'system', label: t('settings.tabs.system'), icon: Settings },
    ];

    const updateSetting = (category: string, key: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [category]: prev[category].map(s => 
                s.key === key ? { ...s, value } : s
            )
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        setError(null);
        setSaved(false);

        try {
            const updates = Object.values(settings).flat().map(s => ({
                key: s.key,
                value: s.value
            }));

            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save settings');
            }

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general':
                return <GeneralSettings settings={settings.general || []} onUpdate={updateSetting} />;
            case 'localization':
                return <LocalizationSettings settings={settings.localization || []} onUpdate={updateSetting} />;
            case 'catalog':
                return <CatalogSettings settings={settings.catalog || []} onUpdate={updateSetting} />;
            case 'filters':
                return <FiltersSettings settings={settings.filters || []} onUpdate={updateSetting} />;
            case 'orders':
                return <OrdersSettings settings={settings.orders || []} onUpdate={updateSetting} />;
            case 'security':
                return <SecuritySettings settings={settings.security || []} onUpdate={updateSetting} />;
            case 'system':
                return <SystemSettings settings={settings.system || []} onUpdate={updateSetting} />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">⚙️ {t('settings.title')}</h1>
                    <p className="text-gray-600 mt-1">{t('settings.subtitle', 'Loyiha sozlamalarini boshqarish')}</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? (
                        <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            {t('common.saving', 'Saqlanmoqda...')}
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            {t('settings.save')}
                        </>
                    )}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {saved && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
                    ✅ {t('settings.saved')}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <div className="flex overflow-x-auto">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                                        activeTab === tab.id
                                            ? 'border-blue-600 text-blue-600 bg-blue-50'
                                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
}

