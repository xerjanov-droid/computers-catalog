'use client';

import { Product } from '@/types';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ImageGallery } from './ImageGallery';

import { useTranslation } from 'react-i18next';

interface ProductFormProps {
    initialData?: Product;
}

export function ProductForm({ initialData }: ProductFormProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const [loading, setLoading] = useState(false);


    // Category state
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedMain, setSelectedMain] = useState<number | undefined>(undefined);

    // Initial load & Reset
    useEffect(() => {
        // Fetch categories
        fetch('/api/categories').then(res => res.json()).then(data => {
            setCategories(data);
        });
    }, []);

    // State for form data
    const [formData, setFormData] = useState<Partial<Product>>({
        status: 'in_stock',
        technology: 'laser',
        currency: 'UZS',
        wifi: false,
        duplex: false,
        color_print: false,
    });

    // Form Population from props (TT: 2.1)
    useEffect(() => {
        if (initialData) {
            // Map legacy 'on_order' to 'pre_order' if present
            const safeStatus = (initialData.status as string) === 'on_order' ? 'pre_order' : initialData.status;

            setFormData({
                ...initialData,
                status: safeStatus
            });

            // Set main category if present (using the new API fields or falling back)
            if ((initialData as any).main_category_id) {
                setSelectedMain((initialData as any).main_category_id);
            } else if (initialData.category_id) {
                // Fallback logic if API didn't return main_category_id yet (cached data?)
                // We'll rely on the categories list loading to find parent... 
                // But better to trust the prop if it's there.
            }
        }
    }, [initialData]);

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

        // Validation (TT: 3)
        if (!formData.brand || !formData.brand.trim()) {
            alert("Brand is required!");
            return;
        }
        if (!formData.model || !formData.model.trim()) {
            alert("Model is required!");
            return;
        }

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
                alert('Error saving product');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Images */}
            <div className="lg:col-span-1">
                {initialData && initialData.id ? (
                    <ImageGallery
                        productId={initialData.id}
                        initialImages={initialData.images || []}
                    />
                ) : (
                    <div className="bg-white p-6 rounded-2xl shadow-sm text-center text-gray-500">
                        Please save the product first to upload images.
                    </div>
                )}
            </div>

            {/* Right Column: Key Details */}
            <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6 bg-white p-6 rounded-2xl shadow-sm h-fit">
                <h2 className="text-xl font-bold mb-4">Product Details</h2>

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

                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Title (RU)</label>
                        <input name="title_ru" required className="w-full border p-2 rounded" value={formData.title_ru || ''} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Title (UZ)</label>
                        <input name="title_uz" required className="w-full border p-2 rounded" value={formData.title_uz || ''} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Title (EN)</label>
                        <input name="title_en" required className="w-full border p-2 rounded" value={formData.title_en || ''} onChange={handleChange} />
                    </div>
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

                {/* Category Selection */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Main Category</label>
                        <select
                            className="w-full border p-2 rounded"
                            value={selectedMain}
                            onChange={(e) => {
                                setSelectedMain(Number(e.target.value));
                                setFormData(prev => ({ ...prev, category_id: undefined })); // Reset sub
                            }}
                        >
                            <option value="">Select Main...</option>
                            {categories.filter(c => !c.parent_id).map(c => (
                                <option key={c.id} value={c.id}>{c.name_ru}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Sub Category</label>
                        <select
                            name="category_id"
                            required
                            className="w-full border p-2 rounded"
                            value={formData.category_id || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, category_id: Number(e.target.value) }))}
                            disabled={!selectedMain}
                        >
                            <option value="">Select Sub...</option>
                            {categories.filter(c => c.parent_id === selectedMain).map(c => (
                                <option key={c.id} value={c.id}>{c.name_ru}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select name="status" className="w-full border p-2 rounded" value={formData.status} onChange={handleChange}>
                        <option value="in_stock">{t('statuses.in_stock')}</option>
                        <option value="pre_order">{t('statuses.pre_order')}</option>
                        <option value="showroom">{t('statuses.showroom')}</option>
                        <option value="archived">{t('statuses.archived')}</option>
                    </select>
                </div>

                <button disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold w-full">
                    {loading ? 'Saving...' : 'Save Product'}
                </button>
            </form>
        </div>
    );
}
