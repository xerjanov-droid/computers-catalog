'use client';

import { X } from 'lucide-react';

interface Filters {
    entity_type: string;
    action: string;
    user_id: string;
    start_date: string;
    end_date: string;
    level: string;
    error_code: string;
}

interface Props {
    filters: Filters;
    onFiltersChange: (filters: Filters) => void;
    onClear: () => void;
    entityTypes: string[];
    actions: string[];
    activeTab: 'audit' | 'system';
}

export function LogsFilters({ filters, onFiltersChange, onClear, entityTypes, actions, activeTab }: Props) {
    const updateFilter = (key: keyof Filters, value: string) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    const hasActiveFilters = Object.values(filters).some(v => v !== '');

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">3️⃣ Filters (Loglar uchun)</h3>
                {hasActiveFilters && (
                    <button
                        onClick={onClear}
                        className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                    >
                        <X className="w-4 h-4" />
                        Tozalash
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeTab === 'audit' ? (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Entity Type
                            </label>
                            <select
                                value={filters.entity_type}
                                onChange={(e) => updateFilter('entity_type', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Barchasi</option>
                                {entityTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Action
                            </label>
                            <select
                                value={filters.action}
                                onChange={(e) => updateFilter('action', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Barchasi</option>
                                {actions.map(action => (
                                    <option key={action} value={action}>{action}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                User ID
                            </label>
                            <input
                                type="text"
                                value={filters.user_id}
                                onChange={(e) => updateFilter('user_id', e.target.value)}
                                placeholder="User ID"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Level
                            </label>
                            <select
                                value={filters.level}
                                onChange={(e) => updateFilter('level', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Barchasi</option>
                                <option value="error">Error</option>
                                <option value="warn">Warning</option>
                                <option value="info">Info</option>
                                <option value="debug">Debug</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Error Code
                            </label>
                            <input
                                type="text"
                                value={filters.error_code}
                                onChange={(e) => updateFilter('error_code', e.target.value)}
                                placeholder="Error code"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                    </label>
                    <input
                        type="date"
                        value={filters.start_date}
                        onChange={(e) => updateFilter('start_date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                    </label>
                    <input
                        type="date"
                        value={filters.end_date}
                        onChange={(e) => updateFilter('end_date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>
        </div>
    );
}

