"use client";

import { useState, useEffect } from 'react';
import { Characteristic } from '@/types';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { X, Search, Check, Plus } from 'lucide-react';

interface Props {
    categoryId: number;
    existingIds: number[]; // IDs already linked to this category
    onClose: () => void;
    onSuccess: () => void;
}

export function LinkCharacteristicModal({ categoryId, existingIds, onClose, onSuccess }: Props) {
    const { t, language } = useAdminLanguage();
    const [loading, setLoading] = useState(false);
    const [characteristics, setCharacteristics] = useState<Characteristic[]>([]);
    const [search, setSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [submitting, setSubmitting] = useState(false);

    // Fetch all global characteristics
    useEffect(() => {
        fetchCharacteristics();
    }, []);

    const fetchCharacteristics = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/characteristics');
            if (res.ok) {
                const data = await res.json();
                // Filter out already linked ones
                const available = data.filter((c: Characteristic) => !existingIds.includes(c.id));
                setCharacteristics(available);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleLink = async () => {
        if (selectedIds.length === 0) return;
        setSubmitting(true);

        try {
            // We link them one by one or we could create a bulk endpoint.
            // For now, loop requests is fine for admin interface.
            const promises = selectedIds.map(charId =>
                fetch(`/api/admin/categories/${categoryId}/characteristics`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        characteristic_id: charId,
                        is_required: false, // Default
                        show_in_key_specs: false, // Default
                        order_index: 0 // Default, appended to end probably or user sorts later
                    })
                })
            );

            await Promise.all(promises);
            onSuccess();
        } catch (error) {
            console.error(error);
            alert('Failed to link characteristics');
        } finally {
            setSubmitting(false);
        }
    };

    // Filter by search
    const filtered = characteristics.filter(c => {
        const name = c[`name_${language}` as keyof Characteristic] || c.name_ru || '';
        return name.toLowerCase().includes(search.toLowerCase()) || c.key.toLowerCase().includes(search.toLowerCase());
    });

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <h2 className="font-semibold text-lg text-gray-800">Link Existing Characteristics</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 border-b">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or key..."
                            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {loading ? (
                        <div className="p-8 text-center text-gray-400">Loading characteristics...</div>
                    ) : filtered.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">No available characteristics found.</div>
                    ) : (
                        filtered.map(char => (
                            <div
                                key={char.id}
                                onClick={() => handleToggle(char.id)}
                                className={`flex items-center p-3 rounded-lg border cursor-pointer transition ${selectedIds.includes(char.id)
                                        ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-300'
                                        : 'bg-white border-gray-100 hover:bg-gray-50'
                                    }`}
                            >
                                <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition ${selectedIds.includes(char.id) ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 bg-white'
                                    }`}>
                                    {selectedIds.includes(char.id) && <Check className="w-3 h-3" />}
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900">
                                        {char[`name_${language}` as keyof Characteristic] || char.name_ru}
                                    </div>
                                    <div className="text-xs text-gray-500 font-mono">
                                        {char.key}
                                    </div>
                                </div>
                                <div className="text-xs text-gray-400 uppercase border px-1.5 py-0.5 rounded bg-gray-50">
                                    {char.type}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t bg-gray-50 rounded-b-xl flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                        {selectedIds.length} selected
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleLink}
                            disabled={selectedIds.length === 0 || submitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {submitting ? 'Linking...' : 'Link Selected'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

