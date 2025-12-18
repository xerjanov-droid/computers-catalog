'use client';

import { Product } from '@/types';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProductFormProps {
    initialData?: Product;
}

export function ProductForm({ initialData }: ProductFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Minimal state for demo. Real app needs form library (react-hook-form) + zod
    const [formData, setFormData] = useState<Partial<Product>>(initialData || {
        status: 'in_stock',
        technology: 'laser',
        currency: 'UZS',
        wifi: false,
        duplex: false,
        color_print: false,
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
                ? `/api/admin/products/${initialData.id}`
                : '/api/admin/products';

            const res = await fetch(url, {
                method: initialData ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push('/admin/products');
                router.refresh();
            } else {
                alert('Error saving product'); // TODO: Better error handling
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white p-6 rounded-2xl shadow-sm">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Brand</label>
                    <input name="brand" required className="w-full border p-2 rounded" value={formData.brand || ''} onChange={handleChange} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Model</label>
                    <input name="model" required className="w-full border p-2 rounded" value={formData.model || ''} onChange={handleChange} />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">SKU</label>
                <input name="sku" required className="w-full border p-2 rounded" value={formData.sku || ''} onChange={handleChange} />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Title (RU)</label>
                <input name="title_ru" required className="w-full border p-2 rounded" value={formData.title_ru || ''} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Price</label>
                    <input name="price" type="number" required className="w-full border p-2 rounded" value={formData.price || 0} onChange={handleChange} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Currency</label>
                    <select name="currency" className="w-full border p-2 rounded" value={formData.currency} onChange={handleChange}>
                        <option value="UZS">UZS</option>
                        <option value="USD">USD</option>
                    </select>
                </div>
            </div>

            <div className="flex gap-4">
                <label className="flex items-center gap-2">
                    <input name="wifi" type="checkbox" checked={formData.wifi} onChange={handleChange} />
                    <span>Wi-Fi</span>
                </label>
                <label className="flex items-center gap-2">
                    <input name="duplex" type="checkbox" checked={formData.duplex} onChange={handleChange} />
                    <span>Duplex</span>
                </label>
                <label className="flex items-center gap-2">
                    <input name="color_print" type="checkbox" checked={formData.color_print} onChange={handleChange} />
                    <span>Color Print</span>
                </label>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select name="status" className="w-full border p-2 rounded" value={formData.status} onChange={handleChange}>
                    <option value="in_stock">In Stock</option>
                    <option value="pre_order">Pre-Order</option>
                    <option value="showroom">Showroom</option>
                </select>
            </div>

            <button disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold">
                {loading ? 'Saving...' : 'Save Product'}
            </button>
        </form>
    );
}
