"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCharacteristic, updateCharacteristic } from '@/app/actions/characteristics';
import { Characteristic } from '@/types';
import { Plus, X } from 'lucide-react';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';

interface Props {
    initialData?: Characteristic;
}

export function CharacteristicForm({ initialData }: Props) {
    const { t } = useAdminLanguage();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        key: initialData?.key || '',
        name_ru: initialData?.name_ru || '',
        name_uz: initialData?.name_uz || '',
        name_en: initialData?.name_en || '',
        type: initialData?.type || 'text',
        is_filterable: initialData?.is_filterable ?? true,
        options: (initialData?.options as string[]) || []
    });

    const [newOption, setNewOption] = useState('');

    const handleChange = (field: string, value: any) => {
        setForm(prev => {
            const updates: any = { [field]: value };
            // Auto-slugify key from name_ru if key is empty
            if (field === 'name_ru' && !prev.key && !initialData) {
                updates.key = value.toLowerCase().replace(/[^a-z0-9]/g, '_');
            }
            return { ...prev, ...updates };
        });
    };

    const addOption = () => {
        if (!newOption.trim()) return;
        setForm(prev => ({
            ...prev,
            options: [...prev.options, newOption.trim()]
        }));
        setNewOption('');
    };

    const removeOption = (idx: number) => {
        setForm(prev => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== idx)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const payload = {
            ...form,
            // Ensure options are cleared if type doesn't need them
            options: ['select', 'multiselect'].includes(form.type) ? form.options : []
        };

        const res = initialData
            ? await updateCharacteristic(initialData.id, payload)
            : await createCharacteristic(payload);

        if (res.success) {
            router.push('/admin/characteristics');
        } else {
            setError(res.error || 'Failed to save');
            setLoading(false);
        }
    };

    const showOptions = ['select', 'multiselect'].includes(form.type);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('characteristics.form.name_ru')} *</label>
                    <input
                        required
                        type="text"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={form.name_ru}
                        onChange={(e) => handleChange('name_ru', e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('characteristics.form.key')} *</label>
                    <input
                        required
                        type="text"
                        className="w-full px-4 py-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                        value={form.key}
                        onChange={(e) => handleChange('key', e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('characteristics.form.name_uz')}</label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={form.name_uz}
                        onChange={(e) => handleChange('name_uz', e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('characteristics.form.name_en')}</label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={form.name_en}
                        onChange={(e) => handleChange('name_en', e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('characteristics.form.type')} *</label>
                        <select
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            value={form.type}
                            onChange={(e) => handleChange('type', e.target.value)}
                        >
                            <option value="text">Text (String)</option>
                            <option value="number">Number</option>
                            <option value="boolean">Boolean (Yes/No)</option>
                            <option value="select">Select (Dropdown)</option>
                            <option value="multiselect">Multi-Select</option>
                            <option value="range">Range (Min-Max)</option>
                        </select>
                    </div>
                    <div className="flex items-end pb-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                checked={form.is_filterable}
                                onChange={(e) => handleChange('is_filterable', e.target.checked)}
                            />
                            <span className="text-gray-900 font-medium">{t('characteristics.form.use_filter')}</span>
                        </label>
                    </div>
                </div>

                {/* Dynamic Options Builder */}
                {showOptions && (
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <label className="block text-sm font-bold text-gray-900 mb-4">
                            Dropdown Options
                        </label>

                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                placeholder="Enter option value (e.g. 16GB)"
                                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newOption}
                                onChange={(e) => setNewOption(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                            />
                            <button
                                type="button"
                                onClick={addOption}
                                className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Add
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {form.options.map((opt, idx) => (
                                <span key={idx} className="bg-white border px-3 py-1 rounded-full text-sm font-medium text-gray-700 flex items-center gap-2 shadow-sm">
                                    {opt}
                                    <button
                                        type="button"
                                        onClick={() => removeOption(idx)}
                                        className="text-gray-400 hover:text-red-500"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                            {form.options.length === 0 && (
                                <p className="text-sm text-gray-400 italic">No options added yet.</p>
                            )}
                        </div>
                    </div>
                )}

                <div className="pt-6 border-t flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium transition"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 font-medium transition shadow-sm disabled:opacity-50"
                    >
                        {loading ? t('common.save') + '...' : t('common.save')}
                    </button>
                </div>
        </form>
    );
}
