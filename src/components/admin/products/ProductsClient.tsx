"use client";

import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/types';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { Plus, Search, Copy, Edit, Archive, Loader2 } from 'lucide-react';
import { bulkUpdateStatus, duplicateProduct } from '@/app/actions/products';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface Props {
    stats: { total: number; in_stock: number; pre_order: number; showroom: number };
    categories: any[];
}

export function ProductsClient({ stats, categories }: Props) {
    const { t, language } = useAdminLanguage();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Helper to get localized category name
    const getCategoryName = (category: any) => {
        if (!category) return '';
        return category[`name_${language}`] || category.name_ru || category.name_uz || category.name_en || '-';
    };

    // Helper to format price: "12 000 000"
    const formatPrice = (price: number | string) => {
        const num = Number(price);
        if (isNaN(num)) return '0';
        return num.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    };

    // 1. URL State
    const currentSearch = searchParams.get('search') || '';
    const currentCategory = searchParams.get('category_id') || '';
    const currentSubcategory = searchParams.get('subcategory_id') || '';
    const currentStatus = searchParams.get('status') || '';

    // 2. Local State
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [searchTerm, setSearchTerm] = useState(currentSearch);

    // 3. Debounced Search Term (to avoid too many API calls)
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 400); // 400ms debounce
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // 4. Fetch Products
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (debouncedSearch) params.set('search', debouncedSearch);
            if (currentCategory && currentCategory !== 'all') params.set('category_id', currentCategory);
            if (currentSubcategory && currentSubcategory !== 'all') params.set('subcategory_id', currentSubcategory);
            if (currentStatus && currentStatus !== 'all') params.set('status', currentStatus);

            const res = await fetch(`/api/admin/products?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setProducts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, currentCategory, currentSubcategory, currentStatus]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // 5. Derived Data for UI
    const parentCategories = categories.filter(c => !c.parent_id);
    const subCategories = currentCategory && currentCategory !== 'all'
        ? categories.filter(c => c.parent_id === parseInt(currentCategory))
        : [];

    // 4. Helper to update URL
    const updateFilters = useCallback((updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(updates).forEach(([key, value]) => {
            if (value && value !== '' && value !== 'all') {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });

        // Reset subcategory if category changes
        if (updates.category_id !== undefined && updates.category_id !== currentCategory) {
            params.delete('subcategory_id');
        }

        router.push(`${pathname}?${params.toString()}`);
    }, [searchParams, router, pathname, currentCategory]);

    // Selection Logic
    const toggleSelect = (id: number) => {
        const newSet = new Set(selected);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelected(newSet);
    };

    const toggleSelectAll = () => {
        if (selected.size === products.length) setSelected(new Set());
        else setSelected(new Set(products.map(p => p.id)));
    };

    // Bulk Actions
    const handleBulkStatus = async (status: string) => {
        if (!confirm(`Change status of ${selected.size} items to ${status}?`)) return;
        await bulkUpdateStatus(Array.from(selected), status);
        setSelected(new Set());
        fetchProducts(); // Refresh list
    };

    const handleDuplicate = async (id: number) => {
        await duplicateProduct(id);
        fetchProducts(); // Refresh list
    };

    return (
        <div className="space-y-6">
            {/* 1. Quick Metrics */}
            <div className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
                <MetricBadge label={t('dashboard.stats.total_products')} count={stats.total} color="gray" />
                <MetricBadge label={t('dashboard.stats.in_stock')} count={stats.in_stock} color="green" />
                <MetricBadge label={t('dashboard.stats.pre_order')} count={stats.pre_order} color="yellow" />
                <MetricBadge label={t('dashboard.stats.showroom')} count={stats.showroom} color="blue" />
            </div>

            {/* 2. Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex gap-4 w-full md:w-auto flex-1">
                    {/* Search */}
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('common.search')}
                            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Parent Category */}
                    <select
                        className="px-4 py-2 border rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
                        value={currentCategory || 'all'}
                        onChange={e => updateFilters({ category_id: e.target.value })}
                    >
                        <option value="all">{t('filters.all_categories')}</option>
                        {parentCategories.map(c => <option key={c.id} value={c.id}>{getCategoryName(c)}</option>)}
                    </select>

                    {/* Sub Category (Dependent) */}
                    <select
                        className="px-4 py-2 border rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px] disabled:opacity-50 disabled:bg-gray-50"
                        value={currentSubcategory || 'all'}
                        onChange={e => updateFilters({ subcategory_id: e.target.value })}
                        disabled={!currentCategory || currentCategory === 'all' || subCategories.length === 0}
                    >
                        <option value="all">{subCategories.length === 0 && currentCategory && currentCategory !== 'all' ? 'No Subcategories' : t('filters.all_subcategories')}</option>
                        {subCategories.map(c => <option key={c.id} value={c.id}>{getCategoryName(c)}</option>)}
                    </select>

                    {/* Status */}
                    <select
                        className="px-4 py-2 border rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                        value={currentStatus || 'all'}
                        onChange={e => updateFilters({ status: e.target.value })}
                    >
                        <option value="all">{t('filters.all_statuses')}</option>
                        <option value="in_stock">{t('statuses.in_stock')}</option>
                        <option value="pre_order">{t('statuses.pre_order')}</option>
                        <option value="showroom">{t('statuses.showroom')}</option>
                        <option value="archived">{t('statuses.archived')}</option>
                    </select>

                    {/* Reset Button (Optional but useful) */}
                    {(currentSearch || currentCategory || currentStatus) && (
                        <button
                            onClick={() => router.push(pathname)}
                            className="px-3 py-2 text-sm text-gray-500 hover:text-red-500 transition"
                        >
                            {t('filters.clear')}
                        </button>
                    )}
                </div>
                <Link
                    href="/admin/products/new"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    {t('common.add_new')}
                </Link>
            </div>

            {/* 3. Bulk Actions Panel (Conditional) */}
            {selected.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-6 z-50 animate-in slide-in-from-bottom-4">
                    <span className="font-medium text-sm">{selected.size} selected</span>
                    <div className="h-4 w-px bg-gray-700"></div>
                    <div className="flex gap-2">
                        <button onClick={() => handleBulkStatus('in_stock')} className="hover:text-green-400 text-sm font-medium transition">{t('statuses.in_stock')}</button>
                        <button onClick={() => handleBulkStatus('pre_order')} className="hover:text-yellow-400 text-sm font-medium transition">{t('statuses.pre_order')}</button>
                        <button onClick={() => handleBulkStatus('showroom')} className="hover:text-blue-400 text-sm font-medium transition">{t('statuses.showroom')}</button>
                    </div>
                    <div className="h-4 w-px bg-gray-700"></div>
                    <button onClick={() => handleBulkStatus('archived')} className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-1">
                        <Archive className="w-4 h-4" /> {t('statuses.archived')}
                    </button>
                </div>
            )}

            {/* 4. Products Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase border-b">
                        <tr>
                            <th className="w-12 px-6 py-4">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    checked={selected.size === products.length && products.length > 0}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th className="px-6 py-4">{t('product.model')}</th>
                            <th className="px-6 py-4">{t('common.main_category')}</th>
                            <th className="px-6 py-4">{t('common.price')}</th>
                            <th className="px-6 py-4">{t('common.status')}</th>
                            <th className="px-6 py-4 text-right">{t('common.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="text-center py-12 text-gray-500">
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Loading products...
                                    </div>
                                </td>
                            </tr>
                        ) : products.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-12 text-gray-500">
                                    No products found matching your filters.
                                </td>
                            </tr>
                        ) : (
                            products.map(product => (
                                <tr key={product.id} className={`hover:bg-gray-50 transition ${selected.has(product.id) ? 'bg-blue-50/50' : ''}`}>
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            checked={selected.has(product.id)}
                                            onChange={() => toggleSelect(product.id)}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0">
                                                {/* Img placeholder */}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{product.title_ru}</div>
                                                <div className="text-xs text-gray-500">SKU: {product.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {getCategoryName(categories.find(c => c.id === product.category_id))}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-sm">
                                        {formatPrice(product.price)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={product.status} t={t} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleDuplicate(product.id)} className="p-2 text-gray-400 hover:text-blue-600 transition" title="Duplicate">
                                                <Copy className="w-4 h-4" />
                                            </button>
                                            <Link href={`/admin/products/${product.id}`} className="p-2 text-gray-400 hover:text-blue-600 transition" title="Edit">
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function MetricBadge({ label, count, color }: any) {
    const colors: any = {
        gray: 'bg-gray-100 text-gray-700',
        green: 'bg-green-100 text-green-700',
        yellow: 'bg-yellow-100 text-yellow-700',
        blue: 'bg-blue-100 text-blue-700',
    };
    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${colors[color]} whitespace-nowrap`}>
            <span className="text-xs font-medium uppercase tracking-wide opacity-75">{label}</span>
            <span className="font-bold text-sm">{count}</span>
        </div>
    );
}

function StatusBadge({ status, t }: { status: string, t: any }) {
    const styles: any = {
        in_stock: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
        pre_order: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
        showroom: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
        archived: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-500' },
    };
    const style = styles[status] || styles.in_stock;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
            {t ? t(`statuses.${status}`) : status}
        </span>
    );
}
