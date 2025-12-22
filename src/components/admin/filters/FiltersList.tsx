'use client';

import { useState, useEffect } from 'react';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { Trash2, Edit2, GripVertical, Check, X } from 'lucide-react';

interface FilterItem {
    id: number | null; // Null if not yet configured as a filter
    characteristic_id: number | null;
    characteristic_key?: string;
    type: 'select' | 'range' | 'checkbox';
    label_ru: string;
    label_uz: string;
    label_en: string;
    is_enabled: boolean;
    order_index: number;
    characteristic_name_ru?: string;
    source_type: string;
    is_configured: boolean;
}

interface FiltersListProps {
    subcategoryId: number;
    refreshTrigger: number;
}

export function FiltersList({ subcategoryId, refreshTrigger }: FiltersListProps) {
    const { t, language } = useAdminLanguage();
    const [filters, setFilters] = useState<FilterItem[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchFilters = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/filters?subcategory_id=${subcategoryId}`);
            if (res.ok) {
                const data = await res.json();
                setFilters(data);
            } else {
                console.error('Failed to fetch filters');
            }
        } catch (error) {
            console.error('Error fetching filters:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (subcategoryId) {
            fetchFilters();
        }
    }, [subcategoryId, refreshTrigger]);

    const toggleFilter = async (filter: FilterItem) => {
        const currentStatus = filter.is_enabled;

        try {
            if (filter.id) {
                // Existing filter -> Update
                const res = await fetch(`/api/admin/filters/${filter.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ is_enabled: !currentStatus })
                });
                if (res.ok) {
                    setFilters(prev => prev.map(f => f.id === filter.id ? { ...f, is_enabled: !currentStatus } : f));
                }
            } else {
                // New filter from characteristic -> Create
                const res = await fetch(`/api/admin/filters`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        subcategory_id: subcategoryId,
                        characteristic_id: filter.characteristic_id,
                        type: filter.type,
                        label_ru: filter.label_ru, // Use characteristic name as default label
                        label_uz: filter.label_uz,
                        label_en: filter.label_en,
                        is_enabled: true,
                        source_type: 'characteristic'
                    })
                });
                if (res.ok) {
                    const newFilter = await res.json();
                    setFilters(prev => prev.map(f =>
                        f.characteristic_id === filter.characteristic_id ? { ...f, ...newFilter, is_configured: true } : f
                    ));
                    // Or just re-fetch to be safe
                    fetchFilters();
                }
            }
        } catch (error) {
            console.error('Error toggling filter:', error);
        }
    };

    const deleteFilter = async (id: number) => {
        if (!confirm('Are you sure you want to remove this filter?')) return;

        try {
            const res = await fetch(`/api/admin/filters/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setFilters(prev => prev.filter(f => f.id !== id));
            }
        } catch (error) {
            console.error('Error deleting filter:', error);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Loading filters...</div>;

    return (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 border-b text-sm text-gray-500 uppercase">
                        <th className="p-4 w-12 text-center">#</th>
                        <th className="p-4">Filtr nomi</th>
                        <th className="p-4">Source</th>
                        <th className="p-4">Type</th>
                        <th className="p-4 text-center">Active</th>
                        <th className="p-4 text-center">Order</th>
                        <th className="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {filters.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="p-12 text-center bg-white">
                                <div className="max-w-md mx-auto">
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No filters or characteristics found</h3>
                                    <p className="text-gray-500 mb-8">
                                        This subcategory has no characteristics mapped yet.
                                    </p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        filters.map((filter, index) => (
                            <tr key={filter.id || `char_${filter.characteristic_id}`} className="hover:bg-gray-50 group transition-colors">
                                <td className="p-4 text-center text-gray-400 font-mono text-xs">
                                    {index + 1}
                                </td>
                                <td className="p-4 font-medium text-gray-900">
                                    {filter[`label_${language}` as keyof FilterItem] || filter.label_ru}
                                </td>
                                <td className="p-4 text-sm font-mono text-gray-600">
                                    {filter.source_type === 'custom' ? 'Custom' : filter.characteristic_key}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                                        ${filter.type === 'select' ? 'bg-blue-100 text-blue-700' :
                                            filter.type === 'range' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                        }`}>
                                        {filter.type}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <button
                                        onClick={() => toggleFilter(filter)}
                                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors mx-auto ${filter.is_enabled ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                </td>
                                <td className="p-4 text-center font-mono text-sm text-gray-500">
                                    {filter.order_index}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 hover:bg-gray-200 rounded text-gray-500">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        {filter.is_configured && (
                                            <button
                                                onClick={() => filter.id && deleteFilter(filter.id)}
                                                className="p-2 hover:bg-red-50 rounded text-red-500"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
