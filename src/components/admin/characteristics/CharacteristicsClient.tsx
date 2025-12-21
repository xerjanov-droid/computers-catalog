"use client";

import { useState, useEffect } from 'react';
import { Category, Characteristic } from '@/types';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { Plus, Search, Pencil, Trash2, Check, X } from 'lucide-react';
import { LinkCharacteristicModal } from './LinkCharacteristicModal';
import { CharacteristicForm } from './CharacteristicForm';
import { Link } from 'lucide-react';

interface Props {
    initialCategories: Category[];
}

interface CategoryCharacteristic extends Characteristic {
    is_required: boolean;
    show_in_key_specs: boolean;
    link_order: number;
}

export function CharacteristicsClient({ initialCategories }: Props) {
    const { t, language } = useAdminLanguage();

    const getCategoryName = (c: Category): string => {
        return (c[`name_${language}` as keyof Category] as string) || c.name_ru || '';
    };
    const getCharName = (c: Characteristic): string => {
        if (!c) return '';
        return (c[`name_${language}` as keyof Characteristic] as string) || c.name_ru || c.key || 'Unnamed';
    };

    // Selection State
    const [selectedRootId, setSelectedRootId] = useState<number | null>(null);
    const [selectedSubId, setSelectedSubId] = useState<number | null>(null);

    // Data State
    const [characteristics, setCharacteristics] = useState<CategoryCharacteristic[]>([]);
    const [loading, setLoading] = useState(false);

    // Modal State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [editingChar, setEditingChar] = useState<CategoryCharacteristic | null>(null);

    // Helpers
    const roots = initialCategories || [];
    const selectedRoot = roots.find(c => c.id === selectedRootId);

    // Flatten all subcategories logic removed (user request: V1 is defunct)


    // Helper to determine available "subcategories" for dropdown
    const subCategories = selectedRoot?.children && selectedRoot.children.length > 0
        ? selectedRoot.children
        : (selectedRoot ? [selectedRoot] : []);

    // Auto-select subcategory if there's only one option (e.g. root category without children)
    useEffect(() => {
        if (selectedRootId && subCategories.length === 1) {
            setSelectedSubId(subCategories[0].id);
        }
    }, [selectedRootId, subCategories]);

    // Fetch chars when subcategory changes
    useEffect(() => {
        if (!selectedSubId) {
            setCharacteristics([]);
            return;
        }

        // Clear previous data to avoid showing wrong characteristics while loading
        setCharacteristics([]);
        fetchCharacteristics(selectedSubId);
    }, [selectedSubId]);

    const fetchCharacteristics = async (subId: number) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/categories/${subId}/characteristics`);
            if (res.ok) {
                const data = await res.json();
                setCharacteristics(data);
            }
        } finally {
            setLoading(false);
        }
    };

    // Helper functions moved up

    const handleUnlink = async (charId: number) => {
        if (!selectedSubId) return;
        if (!confirm('Remove this characteristic from the current category?')) return;

        await fetch(`/api/admin/categories/${selectedSubId}/characteristics/${charId}`, { method: 'DELETE' });
        fetchCharacteristics(selectedSubId);
    };

    return (
        <div className="space-y-6">
            {/* 1. Category Selector Toolbar */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {/* Main Category */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                            {t('nav.categories')}
                        </label>
                        <select
                            className="w-full p-2 border rounded-lg bg-gray-50 font-medium"
                            value={selectedRootId || ''}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                setSelectedRootId(val || null);
                                setSelectedSubId(null);
                            }}
                        >
                            <option value="">{t('filters.select_category')}</option>
                            {roots.map(c => (
                                <option key={c.id} value={c.id}>{getCategoryName(c)}</option>
                            ))}
                        </select>
                    </div>

                    {/* Sub Category */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                            {t('filters.all_subcategories')}
                        </label>
                        <select
                            className="w-full p-2 border rounded-lg bg-gray-50 font-medium disabled:opacity-50"
                            value={selectedSubId || ''}
                            onChange={(e) => setSelectedSubId(Number(e.target.value) || null)}
                            disabled={!selectedRootId}
                        >
                            <option value="">
                                {selectedRootId ? t('filters.select_subcategory') : t('filters.select_main_first')}
                            </option>
                            {subCategories.map(c => (
                                <option key={c.id} value={c.id}>{getCategoryName(c)}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-end h-full pt-6 gap-2">
                    <button
                        onClick={() => setIsLinkModalOpen(true)}
                        disabled={!selectedSubId}
                        className="flex items-center gap-2 bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        <Link className="w-4 h-4" />
                        {t('filters.link_existing')}
                    </button>
                    <button
                        onClick={() => {
                            setEditingChar(null);
                            setIsFormOpen(true);
                        }}
                        disabled={!selectedSubId}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" />
                        {t('characteristics.new_btn')}
                    </button>
                </div>
            </div>

            {/* 2. Content Area */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                {!selectedSubId ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{t('filters.select_category')}</h3>
                        <p className="text-sm text-gray-500 max-w-sm text-center">
                            {t('filters.select_subcategory')}
                        </p>
                    </div>
                ) : (
                    // VIEW 2: Characteristics List for Selected Subcategory
                    <div className="flex flex-col h-full">
                        {/* Custom Header similar to image: "Subkategoriya --> Category (Sub)" */}
                        <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                Subkategoriya <span className="text-gray-400">--&gt;</span>
                                <span className="text-blue-600">
                                    {subCategories.find(s => s.id === selectedSubId) ? getCategoryName(subCategories.find(s => s.id === selectedSubId)!) : ''}
                                    {/* Include Parent in title if desired, but user image showed just the subcategory name or simple path */}
                                </span>
                            </h2>
                            {/* Add Button moved here if we want strictly like image, but image had it separate? 
                                Actually image had it in top right of table. The current 'Add' button is in Toolbar.
                                Let's keep it in toolbar for consistency OR move it here if user insists.
                                Image shows it aligned right of the table header.
                            */}
                        </div>

                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12 text-center">#</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Xarakteristika
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                                        Majburiy
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                                        Spec
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                                        Tip
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                                        Tartib
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                                        Amallar
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {characteristics.map((char, index) => (
                                    <tr key={char.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {getCharName(char)}
                                            </div>
                                            <div className="text-xs text-gray-400 font-mono">
                                                {char.key}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {char.is_required ? (
                                                <div className="inline-flex items-center justify-center w-6 h-6 rounded bg-green-100 text-green-600">
                                                    <Check className="w-4 h-4" />
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center justify-center w-6 h-6 rounded bg-gray-100 text-gray-400">
                                                    <X className="w-4 h-4" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {char.show_in_key_specs ? (
                                                <div className="inline-flex items-center justify-center w-6 h-6 rounded bg-blue-100 text-blue-600">
                                                    <Check className="w-4 h-4" />
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center justify-center w-6 h-6 rounded bg-gray-100 text-gray-400">
                                                    <X className="w-4 h-4" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 uppercase border border-gray-200">
                                                {char.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600 font-mono">
                                            {char.link_order ?? 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingChar(char);
                                                        setIsFormOpen(true);
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition border border-yellow-200"
                                                    title={t('common.edit')}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleUnlink(char.id)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition border border-red-200"
                                                    title="Remove from Category"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {characteristics.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-400 font-medium">
                                            {t('common.no_data') === 'common.no_data' ? 'No characteristics found for this category.' : t('common.no_data')}
                                        </td>
                                    </tr>
                                )}
                                {loading && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-400 font-medium">
                                            Loading...
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 3. Modal */}
            {isFormOpen && selectedSubId && (
                <CharacteristicForm
                    initialData={editingChar}
                    categoryId={selectedSubId}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={() => {
                        setIsFormOpen(false);
                        fetchCharacteristics(selectedSubId);
                    }}
                />

            )}

            {isLinkModalOpen && selectedSubId && (
                <LinkCharacteristicModal
                    categoryId={selectedSubId}
                    existingIds={characteristics.map(c => c.id)}
                    onClose={() => setIsLinkModalOpen(false)}
                    onSuccess={() => {
                        setIsLinkModalOpen(false);
                        fetchCharacteristics(selectedSubId);
                    }}
                />
            )}
        </div>
    );
}
