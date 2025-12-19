"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Category, Characteristic } from '@/types';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { Save, ArrowLeft, GripVertical, Plus, Trash } from 'lucide-react';
import Link from 'next/link';

interface Props {
    category?: Category; // Check if editing or new
    allCharacteristics: Characteristic[]; // For mapping tab
    linkedCharacteristics?: any[]; // Initial links
    parents: Category[]; // For parent selection
}

export function CategoryForm({ category, allCharacteristics, linkedCharacteristics = [], parents }: Props) {
    const { t } = useAdminLanguage();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'translations' | 'characteristics'>('general');

    // Form State
    const [formData, setFormData] = useState({
        name_ru: category?.name_ru || '',
        name_uz: category?.name_uz || '',
        name_en: category?.name_en || '',
        slug: category?.slug || '',
        parent_id: category?.parent_id || '',
        is_active: category?.is_active ?? true,
        icon: category?.icon || ''
    });

    // Characteristics State
    // We map existing links to a local state structure
    const [charLinks, setCharLinks] = useState<any[]>(
        linkedCharacteristics.map((l, i) => ({
            ...l,
            tempId: i // For React keys
        }))
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Save Category
            // In a real implementation we would call a Server Action here
            // await updateCategory(category.id, formData);

            // 2. Save Characteristics
            // await updateCategoryCharacteristics(category.id, charLinks);

            alert('Saved successfully! (Simulation)');
            router.push('/admin/categories');
        } catch (err) {
            console.error(err);
            alert('Error saving');
        } finally {
            setLoading(false);
        }
    };

    // Helper to add a characteristic to the list
    const addCharLink = (charId: number) => {
        if (charLinks.find(l => l.characteristic_id === charId)) return;

        const char = allCharacteristics.find(c => c.id === Number(charId));
        if (!char) return;

        setCharLinks([...charLinks, {
            characteristic_id: char.id,
            name_ru: char.name_ru, // For display
            is_required: false,
            show_in_key_specs: false,
            order_index: charLinks.length + 1,
            tempId: Date.now()
        }]);
    };

    const removeCharLink = (index: number) => {
        setCharLinks(charLinks.filter((_, i) => i !== index));
    };

    const updateCharLink = (index: number, field: string, value: any) => {
        const updated = [...charLinks];
        updated[index] = { ...updated[index], [field]: value };
        setCharLinks(updated);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/categories" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {category ? `${t('common.edit')}: ${category.name_ru}` : t('common.add_new')}
                    </h1>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : t('common.save')}
                </button>
            </div>

            {/* Tabs Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="flex gap-8 px-6">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`py-4 text-sm font-medium border-b-2 transition ${activeTab === 'general' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        General Info
                    </button>
                    <button
                        onClick={() => setActiveTab('characteristics')}
                        className={`py-4 text-sm font-medium border-b-2 transition ${activeTab === 'characteristics' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Characteristics Mapping
                    </button>
                    <button
                        onClick={() => setActiveTab('translations')}
                        className={`py-4 text-sm font-medium border-b-2 transition ${activeTab === 'translations' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Translations
                    </button>
                </div>
            </div>

            {/* Form Content */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 min-h-[500px]">

                {/* 1. GENERAL TAB */}
                {activeTab === 'general' && (
                    <div className="space-y-6 max-w-lg">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name (Display)</label>
                            <input
                                type="text"
                                value={formData.name_ru}
                                onChange={e => setFormData({ ...formData, name_ru: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. Computers"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg font-mono text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                            <select
                                value={formData.parent_id}
                                onChange={e => setFormData({ ...formData, parent_id: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">(None - Root Category)</option>
                                {parents.map(p => (
                                    <option key={p.id} value={p.id}>{p.name_ru}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={formData.is_active}
                                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Active</label>
                        </div>
                    </div>
                )}

                {/* 2. CHARACTERISTICS MAPPING TAB */}
                {activeTab === 'characteristics' && (
                    <div className="space-y-6">
                        <div className="flex items-end gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Characteristic to Add</label>
                                <select
                                    id="charSelect"
                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                    onChange={(e) => {
                                        addCharLink(Number(e.target.value));
                                        e.target.value = "";
                                    }}
                                >
                                    <option value="">-- Choose Characteristic --</option>
                                    {allCharacteristics.filter(ac => !charLinks.find(cl => cl.characteristic_id === ac.id)).map(c => (
                                        <option key={c.id} value={c.id}>{c.name_ru} ({c.type})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="pb-2 text-sm text-gray-500">
                                Can't find it? <Link href="/admin/characteristics/new" className="text-blue-600 hover:underline">Create new</Link>
                            </div>
                        </div>

                        {charLinks.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 border-2 border-dashed rounded-xl">
                                No characteristics assigned yet. Add one above.
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <th className="py-3 px-2 w-10"></th>
                                        <th className="py-3 px-2">Characteristic</th>
                                        <th className="py-3 px-2 text-center w-24">Required</th>
                                        <th className="py-3 px-2 text-center w-32">Key Spec</th>
                                        <th className="py-3 px-2 text-center w-24">Order</th>
                                        <th className="py-3 px-2 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {charLinks.sort((a, b) => a.order_index - b.order_index).map((link, idx) => (
                                        <tr key={link.tempId || link.characteristic_id} className="group hover:bg-gray-50">
                                            <td className="py-3 px-2 text-gray-300">
                                                <GripVertical className="w-4 h-4 cursor-move" />
                                            </td>
                                            <td className="py-3 px-2 font-medium text-gray-800">
                                                {link.name_ru}
                                            </td>
                                            <td className="py-3 px-2 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={link.is_required}
                                                    onChange={e => updateCharLink(idx, 'is_required', e.target.checked)}
                                                    className="rounded border-gray-300 text-blue-600"
                                                />
                                            </td>
                                            <td className="py-3 px-2 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={link.show_in_key_specs}
                                                    onChange={e => updateCharLink(idx, 'show_in_key_specs', e.target.checked)}
                                                    className="rounded border-gray-300 text-purple-600"
                                                />
                                            </td>
                                            <td className="py-3 px-2 text-center">
                                                <input
                                                    type="number"
                                                    value={link.order_index}
                                                    onChange={e => updateCharLink(idx, 'order_index', parseInt(e.target.value))}
                                                    className="w-16 px-2 py-1 text-center border rounded text-sm"
                                                />
                                            </td>
                                            <td className="py-3 px-2 text-right">
                                                <button
                                                    onClick={() => removeCharLink(idx)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition"
                                                    title="Remove"
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        <p className="text-xs text-gray-500 italic">
                            * <strong>Key Specs</strong> appear on the product card in the listing.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
