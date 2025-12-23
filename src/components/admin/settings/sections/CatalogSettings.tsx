'use client';

import { Setting } from '@/services/settings.service';

interface Props {
    settings: Setting[];
    onUpdate: (category: string, key: string, value: any) => void;
}

export function CatalogSettings({ settings, onUpdate }: Props) {
    const getSetting = (key: string) => settings.find(s => s.key === key);
    const getValue = (key: string, defaultValue: any = '') => {
        const setting = getSetting(key);
        return setting?.value ?? defaultValue;
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">3️⃣ Catalog Settings</h2>
                <p className="text-gray-600 mb-6">Mahsulotlarga ta'sir qiladigan sozlamalar</p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={getValue('price_visible_default', true)}
                            onChange={(e) => onUpdate('catalog', 'price_visible_default', e.target.checked)}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div>
                            <span className="font-medium text-gray-900">Narx ko'rsatish default holati</span>
                            <p className="text-sm text-gray-500">Yangi mahsulotlar uchun narx ko'rsatish yoqilgan bo'ladi</p>
                        </div>
                    </label>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default product status
                    </label>
                    <select
                        value={getValue('default_product_status', 'in_stock')}
                        onChange={(e) => onUpdate('catalog', 'default_product_status', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="in_stock">In Stock</option>
                        <option value="pre_order">Pre Order</option>
                        <option value="showroom">Showroom</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>

                <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={getValue('sku_auto_generate', true)}
                            onChange={(e) => onUpdate('catalog', 'sku_auto_generate', e.target.checked)}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div>
                            <span className="font-medium text-gray-900">SKU auto-generate</span>
                            <p className="text-sm text-gray-500">SKU avtomatik yaratilsin</p>
                        </div>
                    </label>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bir mahsulotga max rasm soni
                    </label>
                    <input
                        type="number"
                        value={getValue('max_images_per_product', 10)}
                        onChange={(e) => onUpdate('catalog', 'max_images_per_product', parseInt(e.target.value))}
                        min="1"
                        max="50"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rasm maksimal hajmi (MB)
                    </label>
                    <input
                        type="number"
                        value={getValue('max_image_size_mb', 5)}
                        onChange={(e) => onUpdate('catalog', 'max_image_size_mb', parseInt(e.target.value))}
                        min="1"
                        max="50"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>
        </div>
    );
}

