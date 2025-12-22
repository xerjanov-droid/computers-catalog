'use client';

import { useState, useEffect } from 'react';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { Filter } from 'lucide-react';
import { FiltersList } from '@/components/admin/filters/FiltersList';
import { FilterWizard } from '@/components/admin/filters/FilterWizard';

interface Category {
    id: number;
    name_ru: string;
    name_uz?: string;
    name_en?: string;
    parent_id?: number | null;
    children?: Category[];
}

export default function FiltersPage() {
    const { t, language } = useAdminLanguage();
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('');
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [error, setError] = useState('');

    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/admin/categories');
                if (!res.ok) throw new Error('Failed to fetch categories');
                const data = await res.json();
                console.log('Fetched categories:', data);
                setCategories(data);
            } catch (error) {
                console.error('Failed to fetch categories', error);
                setError('Failed to load categories');
            }
        };
        fetchCategories();

        const handleOpenWizard = () => setIsWizardOpen(true);
        document.addEventListener('open-filter-wizard', handleOpenWizard);
        return () => document.removeEventListener('open-filter-wizard', handleOpenWizard);
    }, []);

    const selectedCategory = categories.find(c => c.id.toString() === selectedCategoryId);
    const subcategories = categories.filter(c => c.parent_id?.toString() === selectedCategoryId);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Filter className="w-6 h-6 text-blue-600" />
                        {t('nav.filters') || 'Filters Configuration'}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Configure which filters appear on the user-facing site for each subcategory.
                    </p>
                </div>
            </div>

            {/* Selection Area */}
            <div className="text-xs text-gray-400 mb-2">
                Debug: {categories.length} categories loaded.
                First: {JSON.stringify(categories[0])}
            </div>
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-6">
                    {error}
                </div>
            )}
            <div className="bg-white p-6 rounded-2xl shadow-sm border grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                        Select Category
                    </label>
                    <select
                        className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        value={selectedCategoryId}
                        onChange={(e) => {
                            setSelectedCategoryId(e.target.value);
                            setSelectedSubcategoryId('');
                        }}
                    >
                        <option value="">-- Choose Category --</option>
                        {categories.filter(c => !c.parent_id || c.parent_id === 0).map(category => (
                            <option key={category.id} value={category.id}>
                                {(category as any)[`name_${language}`] || category.name_ru}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                        Select Subcategory
                    </label>
                    <select
                        className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-400"
                        value={selectedSubcategoryId}
                        onChange={(e) => setSelectedSubcategoryId(e.target.value)}
                        disabled={!selectedCategoryId}
                    >
                        <option value="">-- Choose Subcategory --</option>
                        {subcategories.map(subcategory => (
                            <option key={subcategory.id} value={subcategory.id}>
                                {(subcategory as any)[`name_${language}`] || subcategory.name_ru}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Content Area */}
            {selectedSubcategoryId ? (
                <>
                    <div className="p-6 border-b flex items-center justify-between bg-white rounded-t-2xl border-x border-t">
                        <h2 className="font-bold text-lg text-gray-800">
                            Active Filters
                        </h2>
                        <button
                            onClick={() => setIsWizardOpen(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
                        >
                            + Add Filter
                        </button>
                    </div>

                    <FiltersList
                        subcategoryId={parseInt(selectedSubcategoryId)}
                        refreshTrigger={refreshTrigger}
                    />
                </>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed">
                    <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-gray-500 font-medium">Select a subcategory to manage filters</h3>
                </div>
            )}

            {isWizardOpen && selectedSubcategoryId && (
                <FilterWizard
                    subcategoryId={parseInt(selectedSubcategoryId)}
                    onClose={() => setIsWizardOpen(false)}
                    onSuccess={() => {
                        setIsWizardOpen(false);
                        setRefreshTrigger(prev => prev + 1);
                    }}
                />
            )}
        </div>
    );
}
