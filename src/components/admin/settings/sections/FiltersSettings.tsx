'use client';

import { Setting } from '@/services/settings.service';

interface Props {
    settings: Setting[];
    onUpdate: (category: string, key: string, value: any) => void;
}

export function FiltersSettings({ settings, onUpdate }: Props) {
    const getSetting = (key: string) => settings.find(s => s.key === key);
    const getValue = (key: string, defaultValue: any = '') => {
        const setting = getSetting(key);
        return setting?.value ?? defaultValue;
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">4️⃣ Filters Settings</h2>
                <p className="text-gray-600 mb-6">Filtrlar sozlamalari</p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Filtrlar qaysi sahifada chiqsin
                    </label>
                    <select
                        value={getValue('show_filters_on', 'category_page')}
                        onChange={(e) => onUpdate('filters', 'show_filters_on', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="category_page">Category Page</option>
                        <option value="product_list">Product List</option>
                        <option value="both">Both</option>
                    </select>
                </div>

                <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={getValue('hide_empty_filters', true)}
                            onChange={(e) => onUpdate('filters', 'hide_empty_filters', e.target.checked)}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div>
                            <span className="font-medium text-gray-900">Bo'sh filtrlarni yashirish</span>
                            <p className="text-sm text-gray-500">Mahsulot yo'q bo'lgan filtrlarni ko'rsatmaslik</p>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    );
}

