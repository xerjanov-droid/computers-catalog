"use client";

import { useState } from 'react';
import { Product, Category } from '@/types';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { Plus, Search, Filter as FilterIcon, MoreVertical, Edit, Copy, Trash, Archive } from 'lucide-react';
import { bulkUpdateStatus, bulkDeleteProducts, duplicateProduct } from '@/app/actions/products';
import Link from 'next/link';

interface Props {
    initialProducts: Product[];
    stats: { total: number; in_stock: number; pre_order: number; showroom: number };
    categories: any[];
}

export function ProductsClient({ initialProducts, stats, categories }: Props) {
    const { t } = useAdminLanguage();
    const [products, setProducts] = useState(initialProducts);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [filters, setFilters] = useState({ search: '', category: '', status: '' });

    // Filter Logic
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.title_ru.toLowerCase().includes(filters.search.toLowerCase());
        const matchesCategory = filters.category ? p.category_id === parseInt(filters.category) : true;
        const matchesStatus = filters.status ? p.status === filters.status : true;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    // Selection Logic
    const toggleSelect = (id: number) => {
        const newSet = new Set(selected);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelected(newSet);
    };

    const toggleSelectAll = () => {
        if (selected.size === filteredProducts.length) setSelected(new Set());
        else setSelected(new Set(filteredProducts.map(p => p.id)));
    };

    // Bulk Actions
    const handleBulkStatus = async (status: string) => {
        if (!confirm(`Change status of ${selected.size} items to ${status}?`)) return;
        await bulkUpdateStatus(Array.from(selected), status);
        setSelected(new Set());
        // In a real app we'd refresh data here or use optimistic updates
        window.location.reload();
    };

    const handleDuplicate = async (id: number) => {
        await duplicateProduct(id);
        window.location.reload();
    };

    return (
        <div className="space-y-6">
            {/* 1. Quick Metrics */}
            <div className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
                <MetricBadge label={t('dashboard.stats.total_products')} count={stats.total} color="gray" />
                <MetricBadge label={t('dashboard.stats.in_stock')} count={stats.in_stock} color="green" />
                <MetricBadge label="Pre-order" count={stats.pre_order} color="yellow" />
                <MetricBadge label="Showroom" count={stats.showroom} color="blue" />
            </div>

            {/* 2. Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex gap-4 w-full md:w-auto flex-1">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('common.search')}
                            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={filters.search}
                            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        />
                    </div>
                    <select
                        className="px-4 py-2 border rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                        value={filters.category}
                        onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    >
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name_ru}</option>)}
                    </select>
                    <select
                        className="px-4 py-2 border rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                        value={filters.status}
                        onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    >
                        <option value="">All Statuses</option>
                        <option value="in_stock">In Stock</option>
                        <option value="pre_order">Pre-order</option>
                        <option value="showroom">Showroom</option>
                    </select>
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
                        <button onClick={() => handleBulkStatus('in_stock')} className="hover:text-green-400 text-sm font-medium transition">Set In Stock</button>
                        <button onClick={() => handleBulkStatus('pre_order')} className="hover:text-yellow-400 text-sm font-medium transition">Set Pre-order</button>
                        <button onClick={() => handleBulkStatus('showroom')} className="hover:text-blue-400 text-sm font-medium transition">Set Showroom</button>
                    </div>
                    <div className="h-4 w-px bg-gray-700"></div>
                    <button className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-1">
                        <Archive className="w-4 h-4" /> Deactivate
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
                                    checked={selected.size === filteredProducts.length && filteredProducts.length > 0}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th className="px-6 py-4">Product</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Price</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredProducts.map(product => (
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
                                    {categories.find(c => c.id === product.category_id)?.name_ru || '-'}
                                </td>
                                <td className="px-6 py-4 font-mono text-sm">
                                    ${product.price}
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={product.status} />
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
                        ))}
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

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        in_stock: { bg: 'bg-green-50', text: 'text-green-700', label: 'В наличии', dot: 'bg-green-500' },
        pre_order: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Под заказ', dot: 'bg-yellow-500' },
        showroom: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'В шоуруме', dot: 'bg-blue-500' },
        draft: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Draft', dot: 'bg-gray-400' },
    };
    const s = styles[status] || styles.draft;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
            {s.label}
        </span>
    );
}
