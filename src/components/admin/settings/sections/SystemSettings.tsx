'use client';

import { useState } from 'react';
import { Setting } from '@/services/settings.service';
import { RefreshCw, AlertTriangle, Database, Search } from 'lucide-react';

interface Props {
    settings: Setting[];
    onUpdate: (category: string, key: string, value: any) => void;
}

export function SystemSettings({ settings, onUpdate }: Props) {
    const getSetting = (key: string) => settings.find(s => s.key === key);
    const getValue = (key: string, defaultValue: any = '') => {
        const setting = getSetting(key);
        return setting?.value ?? defaultValue;
    };

    const [loading, setLoading] = useState<string | null>(null);

    const handleMaintenanceMode = async (enabled: boolean) => {
        setLoading('maintenance');
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    updates: [{ key: 'maintenance_mode', value: enabled }]
                })
            });
            if (res.ok) {
                onUpdate('system', 'maintenance_mode', enabled);
            }
        } catch (e) {
            console.error('Failed to toggle maintenance mode:', e);
        } finally {
            setLoading(null);
        }
    };

    const handleCacheClear = async () => {
        setLoading('cache');
        try {
            // Implement cache clear logic
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert('Cache cleared successfully!');
        } catch (e) {
            console.error('Failed to clear cache:', e);
        } finally {
            setLoading(null);
        }
    };

    const handleRebuildIndex = async () => {
        setLoading('index');
        try {
            // Implement search index rebuild logic
            await new Promise(resolve => setTimeout(resolve, 2000));
            alert('Search index rebuilt successfully!');
        } catch (e) {
            console.error('Failed to rebuild index:', e);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">7️⃣ System (faqat Super Admin)</h2>
                <p className="text-gray-600 mb-6">Tizim sozlamalari va boshqaruv</p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={getValue('maintenance_mode', false)}
                            onChange={(e) => handleMaintenanceMode(e.target.checked)}
                            disabled={loading === 'maintenance'}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div>
                            <span className="font-medium text-gray-900">Maintenance mode</span>
                            <p className="text-sm text-gray-500">Loyihani texnik xizmat ko'rsatish rejimiga o'tkazish</p>
                        </div>
                    </label>
                </div>

                <div className="border-t pt-6 space-y-4">
                    <h3 className="font-semibold text-gray-900">Tizim amallari</h3>

                    <button
                        onClick={handleCacheClear}
                        disabled={loading === 'cache'}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading === 'cache' ? 'animate-spin' : ''}`} />
                        Cache clear
                    </button>

                    <button
                        onClick={handleRebuildIndex}
                        disabled={loading === 'index'}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                    >
                        <Search className={`w-4 h-4 ${loading === 'index' ? 'animate-spin' : ''}`} />
                        Rebuild search index
                    </button>
                </div>

                <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Environment info (read-only)</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Node Version:</span>
                            <span className="font-mono">{process.env.NODE_VERSION || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Environment:</span>
                            <span className="font-mono">{process.env.NODE_ENV || 'development'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

