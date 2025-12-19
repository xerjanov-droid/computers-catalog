"use client";

import { useState } from 'react';
import { Characteristic } from '@/types';
import { Edit, Trash2, Search } from 'lucide-react';
import Link from 'next/link';

interface Props {
    initialData: Characteristic[];
}

export function CharacteristicsTable({ initialData }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filtered, setFiltered] = useState(initialData);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        const lower = term.toLowerCase();
        setFiltered(initialData.filter(c =>
            c.name_ru.toLowerCase().includes(lower) ||
            c.key.toLowerCase().includes(lower) ||
            c.type.toLowerCase().includes(lower)
        ));
    };

    return (
        <div>
            {/* Toolbar */}
            <div className="p-4 border-b flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, key or type..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                    <tr>
                        <th className="px-6 py-4">Key</th>
                        <th className="px-6 py-4">Name (RU)</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4 text-center">Filterable</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filtered.map((char) => (
                        <tr key={char.id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 font-mono text-sm text-blue-600">{char.key}</td>
                            <td className="px-6 py-4 text-gray-900 font-medium">{char.name_ru}</td>
                            <td className="px-6 py-4 text-sm">
                                <span className={`px-2 py-1 rounded text-xs font-medium border ${getTypeBadge(char.type)}`}>
                                    {char.type}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className={`w-3 h-3 inline-block rounded-full ${char.is_filterable ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <Link
                                    href={`/admin/characteristics/${char.id}`}
                                    className="inline-flex p-2 text-gray-400 hover:text-blue-600 transition"
                                >
                                    <Edit className="w-4 h-4" />
                                </Link>
                                <button className="inline-flex p-2 text-gray-400 hover:text-red-600 transition ml-1">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {filtered.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                No characteristics found matching "{searchTerm}"
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

function getTypeBadge(type: string) {
    switch (type) {
        case 'text': return 'bg-gray-100 text-gray-600 border-gray-200';
        case 'number': return 'bg-blue-50 text-blue-600 border-blue-100';
        case 'boolean': return 'bg-purple-50 text-purple-600 border-purple-100';
        case 'select': return 'bg-orange-50 text-orange-600 border-orange-100';
        case 'multiselect': return 'bg-orange-50 text-orange-600 border-orange-100';
        case 'range': return 'bg-green-50 text-green-600 border-green-100';
        default: return 'bg-gray-100 text-gray-600';
    }
}
