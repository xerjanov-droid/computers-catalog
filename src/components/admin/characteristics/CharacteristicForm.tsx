"use client";

import { useState, useEffect } from 'react';
import { Characteristic, CharacteristicOption } from '@/types';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { X, Plus, Trash2, Loader2, GripVertical } from 'lucide-react';

interface Props {
    initialData: Characteristic | null;
    categoryId?: number;
    onClose: () => void;
    onSuccess: () => void;
}

export function CharacteristicForm({ initialData, categoryId, onClose, onSuccess }: Props) {
    const { t } = useAdminLanguage();
    const [loading, setLoading] = useState(false);

    // Form State (Global)
    const [formData, setFormData] = useState({
        key: '',
        type: 'text',
        name_ru: '',
        name_uz: '',
        name_en: '',
        is_filterable: false
    });

    // Link State (Category Specific)
    const [linkData, setLinkData] = useState({
        is_required: false,
        show_in_key_specs: false,
        order_index: 0
    });

    const [options, setOptions] = useState<Partial<CharacteristicOption>[]>([]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                key: initialData.key,
                type: initialData.type,
                name_ru: initialData.name_ru,
                name_uz: initialData.name_uz || '',
                name_en: initialData.name_en || '',
                is_filterable: initialData.is_filterable
            });

            // Initialize link data if context exists
            if (categoryId) {
                const link = initialData as any; // Cast to access extended props
                setLinkData({
                    is_required: !!link.is_required,
                    show_in_key_specs: !!link.show_in_key_specs,
                    order_index: link.link_order ?? link.order_index ?? 0
                });
            }

            if (initialData.options) {
                setOptions(initialData.options);
            }
        }
    }, [initialData, categoryId]);

    // Auto-generate slug from English name (or RU as fallback)
    useEffect(() => {
        if (!initialData && formData.name_en && !formData.key) {
            const slug = formData.name_en
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '_')
                .replace(/^_+|_+$/g, '');
            setFormData(prev => ({ ...prev, key: slug }));
        }
    }, [formData.name_en, formData.key, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Update/Create Global Characteristic
            const url = initialData
                ? `/api/admin/characteristics/${initialData.id}`
                : '/api/admin/characteristics';

            const method = initialData ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    options: formData.type === 'select' ? options : []
                })
            });

            if (!res.ok) {
                const e = await res.json().catch(() => ({}));
                throw new Error(e.error || 'Failed to save global settings');
            }

            // Get ID for link update
            let charId = initialData?.id;
            if (!charId && res.ok) {
                const newChar = await res.json();
                charId = newChar.id;
            }

            // 2. Update Link Settings if context exists
            if (categoryId && charId) {
                const linkUrl = `/api/admin/categories/${categoryId}/characteristics/${charId}`;

                if (initialData) {
                    // Update existing link
                    const linkRes = await fetch(linkUrl, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(linkData)
                    });
                    if (!linkRes.ok) {
                        const e = await linkRes.json().catch(() => ({}));
                        throw new Error(e.error || 'Failed to update category settings');
                    }
                } else {
                    // Create new and assign (POST to collection)
                    // The 'Assign' endpoint is POST /api/admin/categories/[id]/characteristics
                    const assignRes = await fetch(`/api/admin/categories/${categoryId}/characteristics`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            characteristic_id: charId,
                            ...linkData
                        })
                    });
                    if (!assignRes.ok) {
                        const e = await assignRes.json().catch(() => ({}));
                        throw new Error(e.error || 'Failed to assign to category');
                    }
                }
            }

            onSuccess();
        } catch (err: any) {
            console.error(err);
            alert(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const addOption = () => {
        setOptions([...options, { value: '', label_ru: '', label_uz: '', label_en: '', order_index: options.length }]);
    };

    const updateOption = (index: number, field: keyof CharacteristicOption, value: string) => {
        const newOptions = [...options];
        newOptions[index] = { ...newOptions[index], [field]: value };
        setOptions(newOptions);
    };

    const removeOption = (index: number) => {
        setOptions(options.filter((_, i) => i !== index));
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="font-semibold text-lg">
                        {initialData ? (categoryId ? 'Edit Characteristic & Settings' : 'Edit Characteristic') : 'New Characteristic'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* 1. Category Link Settings (if applicable) */}
                    {categoryId && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-3">
                            <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wide">
                                {t('characteristics.category_settings', 'Kategoriya sozlamalari')}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded border border-blue-100 hover:border-blue-300 transition">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-blue-600 rounded"
                                        checked={linkData.is_required}
                                        onChange={e => setLinkData({ ...linkData, is_required: e.target.checked })}
                                    />
                                    <span className="text-sm font-medium text-gray-800">Majburiy</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded border border-blue-100 hover:border-blue-300 transition">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-blue-600 rounded"
                                        checked={linkData.show_in_key_specs}
                                        onChange={e => setLinkData({ ...linkData, show_in_key_specs: e.target.checked })}
                                    />
                                    <span className="text-sm font-medium text-gray-800">Spec</span>
                                </label>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tartib</label>
                                    <input
                                        type="number"
                                        className="w-full px-2 py-1.5 text-sm border rounded hover:border-blue-400 focus:border-blue-500 outline-none transition"
                                        value={linkData.order_index}
                                        onChange={e => setLinkData({ ...linkData, order_index: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. Global characteristic Settings */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h3 className="text-sm font-bold text-gray-900 uppercase">Global Definition</h3>
                            {categoryId && <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500">Affects all categories</span>}
                        </div>

                        {/* Key & Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Key (Slug)</label>
                                <input
                                    type="text"
                                    required
                                    disabled={!!initialData}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-500 font-mono text-sm"
                                    value={formData.key}
                                    onChange={e => setFormData({ ...formData, key: e.target.value })}
                                    placeholder="e.g. cpu_model"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="text">Text (Yozuv)</option>
                                    <option value="number">Number (Raqam)</option>
                                    <option value="boolean">Boolean (Ha/Yo'q)</option>
                                    <option value="select">Select (Tanlov)</option>
                                </select>
                            </div>
                        </div>

                        {/* Localized Names */}
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 font-bold">Name (UZ)</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:border-blue-500"
                                        value={formData.name_uz}
                                        onChange={e => setFormData({ ...formData, name_uz: e.target.value })}
                                        placeholder="O'zbekcha"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 font-bold">Name (RU) <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:border-blue-500"
                                        value={formData.name_ru}
                                        onChange={e => setFormData({ ...formData, name_ru: e.target.value })}
                                        placeholder="Русский"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 font-bold">Name (EN)</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:border-blue-500"
                                        value={formData.name_en}
                                        onChange={e => setFormData({ ...formData, name_en: e.target.value })}
                                        placeholder="English"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Options (Only if Type=Select) */}
                        {formData.type === 'select' && (
                            <div className="space-y-4 pt-4 border-t">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-medium text-gray-900">Options</h3>
                                    <button
                                        type="button"
                                        onClick={addOption}
                                        className="text-xs flex items-center gap-1 text-white bg-blue-600 px-2 py-1 rounded hover:bg-blue-700 font-medium transition"
                                    >
                                        <Plus className="w-3 h-3" /> Add Option
                                    </button>
                                </div>

                                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                    {options.length === 0 && (
                                        <div className="text-center py-4 text-sm text-gray-400 border border-dashed rounded-lg bg-gray-50">
                                            No options added yet.
                                        </div>
                                    )}
                                    {options.map((opt, idx) => (
                                        <div key={idx} className="flex items-start gap-2 p-2 bg-gray-50 rounded border border-gray-100 group">
                                            <div className="mt-2 text-gray-400 cursor-move">
                                                <GripVertical className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="grid grid-cols-4 gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Value"
                                                        className="px-2 py-1 text-xs font-mono border rounded outline-none w-full"
                                                        value={opt.value}
                                                        onChange={e => updateOption(idx, 'value', e.target.value)}
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="UZ"
                                                        className="px-2 py-1 text-xs border rounded outline-none w-full"
                                                        value={opt.label_uz}
                                                        onChange={e => updateOption(idx, 'label_uz', e.target.value)}
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="RU"
                                                        className="px-2 py-1 text-xs border rounded outline-none w-full"
                                                        value={opt.label_ru}
                                                        onChange={e => updateOption(idx, 'label_ru', e.target.value)}
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="EN"
                                                        className="px-2 py-1 text-xs border rounded outline-none w-full"
                                                        value={opt.label_en}
                                                        onChange={e => updateOption(idx, 'label_en', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeOption(idx)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded transition flex-shrink-0"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Settings */}
                        <div className="border-t pt-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    checked={formData.is_filterable}
                                    onChange={e => setFormData({ ...formData, is_filterable: e.target.checked })}
                                />
                                <span className="text-sm text-gray-700">Allow filtering by this characteristic (Global)</span>
                            </label>
                        </div>
                    </div>

                    <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 sticky bottom-0 -mx-6 -mb-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2 disabled:opacity-70 transition shadow-sm"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
