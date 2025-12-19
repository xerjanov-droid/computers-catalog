'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Category {
    id: number;
    parent_id?: number | null;
    name_ru: string;
    name_uz?: string;
    name_en?: string;
    icon?: string;
    order_index: number;
    is_active: boolean;
}

interface CategoryFormProps {
    initialData?: Category;
    categories: Category[]; // For parent selection
}

export function CategoryForm({ initialData, categories }: CategoryFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<Partial<Category>>(initialData || {
        order_index: 0,
        is_active: true
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = initialData
                ? `/api/admin/categories/${initialData.id}`
                : '/api/admin/categories';

            const res = await fetch(url, {
                method: initialData ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push('/admin/categories');
                router.refresh();
            } else {
                alert('Error saving category');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Filter out self from parent options if editing to prevent cycles
    const parentOptions = categories.filter(c => c.id !== initialData?.id);

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold mb-4">{initialData ? 'Edit Category' : 'New Category'}</h2>

            <div className="space-y-4">
                {/* Languages */}
                <div>
                    <label className="block text-sm font-medium mb-1">Name (RU) *</label>
                    <input name="name_ru" required className="w-full border p-2 rounded" value={formData.name_ru || ''} onChange={handleChange} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Name (UZ)</label>
                    <input name="name_uz" className="w-full border p-2 rounded" value={formData.name_uz || ''} onChange={handleChange} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Name (EN)</label>
                    <input name="name_en" className="w-full border p-2 rounded" value={formData.name_en || ''} onChange={handleChange} />
                </div>

                {/* Hierarchy */}
                <div>
                    <label className="block text-sm font-medium mb-1">Parent Category</label>
                    <select
                        name="parent_id"
                        className="w-full border p-2 rounded"
                        value={formData.parent_id || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, parent_id: e.target.value ? Number(e.target.value) : undefined }))}
                    >
                        <option value="">None (Top Level)</option>
                        {parentOptions.map(c => (
                            <option key={c.id} value={c.id}>{c.name_ru} (ID: {c.id})</option>
                        ))}
                    </select>
                </div>

                {/* Meta */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Order Index</label>
                        <input name="order_index" type="number" required className="w-full border p-2 rounded" value={formData.order_index} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Icon (Emoji/URL)</label>
                        <input name="icon" className="w-full border p-2 rounded" value={formData.icon || ''} onChange={handleChange} />
                    </div>
                </div>

                <div>
                    <label className="flex items-center gap-2">
                        <input name="is_active" type="checkbox" checked={formData.is_active} onChange={handleChange} />
                        <span>Active</span>
                    </label>
                </div>
            </div>

            <button disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
                {loading ? 'Saving...' : 'Save Category'}
            </button>
        </form>
    );
}
