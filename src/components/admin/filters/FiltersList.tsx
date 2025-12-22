'use client';

import { useState, useEffect } from 'react';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { Trash2, Edit2, GripVertical, Check, X } from 'lucide-react';

interface FilterItem {
    id: number;
    characteristic_id: number | null;
    type: 'select' | 'range' | 'checkbox';
    label_ru: string;
    label_uz: string;
    label_en: string;
    is_enabled: boolean;
    order_index: number;
    characteristic_name_ru?: string;
    source_type: string;
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

    const toggleFilter = async (id: number, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/admin/filters/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_enabled: !currentStatus })
            });
            if (res.ok) {
                setFilters(prev => prev.map(f => f.id === id ? { ...f, is_enabled: !currentStatus } : f));
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

    if (filters.length === 0) {
        return <div className="p-8 text-center text-gray-400">No filters configured yet.</div>;
    }

    return (
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-gray-50 border-b text-sm text-gray-500 uppercase">
                    <th className="p-4 w-12 text-center">#</th>
                    <th className="p-4">Filter Name ({language.toUpperCase()})</th>
                    <th className="p-4">Source</th>
                    <th className="p-4">Type</th>
                    <th className="p-4 text-center">User Facing</th>
                    <th className="p-4 text-center">Order</th>
                    <th className="p-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y">
                {filters.map((filter, index) => (
                    <tr key={filter.id} className="hover:bg-gray-50 group transition-colors">
                        <td className="p-4 text-center text-gray-400 font-mono text-xs">
                            {index + 1}
                        </td>
                        <td className="p-4 font-medium text-gray-900">
                            {filter[`label_${language}` as keyof FilterItem] || filter.label_ru}
                        </td>
                        <td className="p-4 text-sm text-gray-500">
                            {filter.source_type === 'custom'
                                ? <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold uppercase">Custom</span>
                                : <span className="flex flex-col">
                                    <span className="text-xs font-bold text-gray-800">Characteristic</span>
                                    <span className="text-xs">{filter.characteristic_name_ru}</span>
                                </span>
                            }
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
                                onClick={() => toggleFilter(filter.id, filter.is_enabled)}
                                className={`w-10 h-6 rounded-full p-1 transition-colors ${filter.is_enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${filter.is_enabled ? 'translate-x-4' : ''}`} />
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
                                <button
                                    onClick={() => deleteFilter(filter.id)}
                                    className="p-2 hover:bg-red-50 rounded text-red-500"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
