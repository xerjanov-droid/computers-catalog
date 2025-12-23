"use client";

import { useState, useEffect } from 'react';
import { Category, Characteristic } from '@/types';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { useAdminCategoryName } from '@/hooks/useAdminCategoryName';
import { Plus, Search, Pencil, Trash2, Check, X, Copy, ArrowLeft } from 'lucide-react';
import { LinkCharacteristicModal } from './LinkCharacteristicModal';
import { CharacteristicForm } from './CharacteristicForm';
import { CopyCharacteristicsModal } from './CopyCharacteristicsModal';
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

    const getCategoryName = useAdminCategoryName();
    const getCharName = (c: any): string => {
        if (!c) return '';
        // API returns 'label' field for localized name, or we can use name_* fields if available
        if (c.label) return c.label;
        if (c[`name_${language}` as keyof typeof c]) return c[`name_${language}` as string];
        if (c.name_ru) return c.name_ru;
        if (c.name_uz) return c.name_uz;
        if (c.name_en) return c.name_en;
        if (c.key) return c.key;
        return 'Unnamed';
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
    const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
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

    // Flatten all subcategories for initial view
    const displayedRoots = selectedRootId
        ? roots.filter(r => r.id === selectedRootId)
        : roots;

    const allSubcategories = displayedRoots.flatMap(root => {
        if (!root.children || root.children.length === 0) {
            // Include root itself if it has no children (standalone category)
            return [{
                ...root,
                parentName: '(Root)',
                rootId: root.id
            }];
        }
        return root.children.map(sub => ({
            ...sub,
            parentName: getCategoryName(root),
            rootId: root.id
        }));
    });

    const selectSubcategory = (rootId: number, subId: number) => {
        setSelectedRootId(rootId);
        setSelectedSubId(subId);
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
                    // VIEW 1: List of All Subcategories (Restored per user request, strictly table view)
                    <div className="p-0">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-blue-50 text-gray-700 font-bold border-b border-blue-100">
                                <tr>
                                    <th className="px-6 py-4 w-16 text-center bg-blue-100/50 border-r border-blue-100">#</th>
                                    <th className="px-6 py-4 border-r border-blue-100">{t('common.main_category')}</th>
                                    <th className="px-6 py-4 border-r border-blue-100">Subkategoriya</th>
                                    <th className="px-6 py-4 w-32 text-center">Xarakteristikalar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {allSubcategories.map((sub, idx) => (
                                    <tr
                                        key={sub.id}
                                        className="hover:bg-blue-50 cursor-pointer transition"
                                        onClick={() => selectSubcategory(sub.rootId || sub.parent_id!, sub.id)}
                                    >
                                        <td className="px-6 py-4 font-mono text-gray-500 text-center bg-gray-50/50 border-r border-gray-100">
                                            {idx + 1}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 border-r border-gray-100">
                                            {sub.parentName}
                                        </td>
                                        <td className="px-6 py-4 text-blue-600 font-medium border-r border-gray-100">
                                            {getCategoryName(sub)}
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-gray-700">
                                            {sub.characteristic_count || 0}
                                        </td>
                                    </tr>
                                ))}
                                {allSubcategories.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                            No categories found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    // VIEW 2: Characteristics List for Selected Subcategory
                    <div className="flex flex-col h-full">
                        {/* Custom Header similar to image: "Subkategoriya --> Category (Sub)" */}
                        <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setSelectedSubId(null)}
                                    className="p-2 hover:bg-gray-200 rounded-full transition text-gray-500 hover:text-gray-700"
                                    title={t('common.back') || 'Back'}
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    Subkategoriya <span className="text-gray-400">--&gt;</span>
                                    <span className="text-blue-600">
                                        {subCategories.find(s => s.id === selectedSubId) ? getCategoryName(subCategories.find(s => s.id === selectedSubId)!) : ''}
                                    </span>
                                </h2>
                            </div>
                        </div>

                        <table className="w-full text-sm text-left">
                            <thead className="bg-white border-b-2 border-gray-100 text-gray-500 font-bold uppercase text-xs tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 text-center w-16">#</th>
                                    <th className="px-6 py-4">XARAKTERISTIKA</th>
                                    <th className="px-6 py-4 text-center w-28">MAJBURIY</th>
                                    <th className="px-6 py-4 text-center w-28">SPEC</th>
                                    <th className="px-6 py-4 text-center w-28">TIP</th>
                                    <th className="px-6 py-4 text-center w-20">TARTIB</th>
                                    <th className="px-6 py-4 text-center w-32">AMALLAR</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {characteristics.map((char, index) => (
                                    <tr key={char.id} className="hover:bg-gray-50 transition group">
                                        <td className="px-6 py-4 text-center text-gray-400 font-mono">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 text-sm">
                                                {getCharName(char)}
                                            </div>
                                            <div className="text-xs text-gray-400 font-mono mt-0.5">
                                                {char.key}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {char.is_required ? (
                                                <div className="inline-flex items-center justify-center w-6 h-6 rounded bg-green-100 text-green-500">
                                                    <Check className="w-4 h-4" strokeWidth={3} />
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center justify-center w-6 h-6 rounded bg-gray-100 text-gray-300">
                                                    <Check className="w-4 h-4" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {char.show_in_key_specs ? (
                                                <div className="inline-flex items-center justify-center w-6 h-6 rounded bg-blue-100 text-blue-500">
                                                    <Check className="w-4 h-4" strokeWidth={3} />
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center justify-center w-6 h-6 rounded bg-gray-100 text-gray-300">
                                                    <Check className="w-4 h-4" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-600 uppercase border border-gray-200">
                                                {char.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm text-gray-600 font-mono">
                                            {char.link_order ?? 0}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => {
                                                        setEditingChar(char);
                                                        setIsFormOpen(true);
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-50 text-yellow-500 hover:bg-yellow-100 border border-yellow-200 transition"
                                                    title={t('common.edit')}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleUnlink(char.id)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 transition"
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
                                            <div className="flex flex-col items-center justify-center gap-4">
                                                <p className="text-gray-500 mb-2">
                                                    {t('common.no_data') === 'common.no_data' ? 'No characteristics found for this category.' : t('common.no_data')}
                                                </p>
                                                <div className="flex gap-4">
                                                    <button
                                                        onClick={() => setIsCopyModalOpen(true)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                        {t('characteristics.copy_from_existing')}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingChar(null);
                                                            setIsFormOpen(true);
                                                        }}
                                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        {t('characteristics.create_new')}
                                                    </button>
                                                </div>
                                            </div>
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

            <CopyCharacteristicsModal
                isOpen={isCopyModalOpen}
                onClose={() => setIsCopyModalOpen(false)}
                targetCategoryId={selectedSubId!}
                targetCategoryName={subCategories.find(s => s.id === selectedSubId)?.name_ru || 'Subcategory'}
                categories={roots.map(r => ({ ...r, children: [] }))} // Pass flat roots or handle relationships
                onSuccess={() => fetchCharacteristics(selectedSubId!)}
            />
        </div>
    );
}
