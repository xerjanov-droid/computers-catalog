'use client';

import { useState, useEffect } from 'react';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { Activity, Filter, Download, RefreshCw, Search, X, Eye } from 'lucide-react';
import { AuditLogsTable } from './AuditLogsTable';
import { SystemLogsTable } from './SystemLogsTable';
import { LogsFilters } from './LogsFilters';

interface AuditLog {
    id: number;
    entity_type: string;
    entity_id: number;
    action: string;
    before_data?: any;
    after_data?: any;
    admin_user_id?: number;
    user_email?: string;
    user_name?: string;
    created_at: Date;
}

interface Props {
    initialAuditLogs: AuditLog[];
    entityTypes: string[];
    actions: string[];
}

export function LogsClient({ initialAuditLogs, entityTypes, actions }: Props) {
    const { t } = useAdminLanguage();
    const [activeTab, setActiveTab] = useState<'audit' | 'system'>('audit');
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
    const [systemLogs, setSystemLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [filters, setFilters] = useState({
        entity_type: '',
        action: '',
        user_id: '',
        start_date: '',
        end_date: '',
        level: '',
        error_code: ''
    });
    const [total, setTotal] = useState(initialAuditLogs.length);
    const [page, setPage] = useState(1);
    const limit = 50;

    const fetchAuditLogs = async (resetPage = false) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.entity_type) params.append('entity_type', filters.entity_type);
            if (filters.action) params.append('action', filters.action);
            if (filters.user_id) params.append('user_id', filters.user_id);
            if (filters.start_date) params.append('start_date', filters.start_date);
            if (filters.end_date) params.append('end_date', filters.end_date);
            params.append('limit', limit.toString());
            params.append('offset', String(((resetPage ? 1 : page) - 1) * limit));

            const res = await fetch(`/api/admin/logs/audit?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setAuditLogs(data.logs);
                setTotal(data.total);
                if (resetPage) setPage(1);
            }
        } catch (e) {
            console.error('Failed to fetch audit logs:', e);
        } finally {
            setLoading(false);
        }
    };

    const fetchSystemLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.level) params.append('level', filters.level);
            if (filters.start_date) params.append('start_date', filters.start_date);
            if (filters.end_date) params.append('end_date', filters.end_date);
            if (filters.error_code) params.append('error_code', filters.error_code);
            params.append('limit', limit.toString());
            params.append('offset', String((page - 1) * limit));

            const res = await fetch(`/api/admin/logs/system?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setSystemLogs(data.logs);
                setTotal(data.total);
            }
        } catch (e) {
            console.error('Failed to fetch system logs:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'audit') {
            fetchAuditLogs();
        } else {
            fetchSystemLogs();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, page]);
    
    // Separate effect for filters to reset page
    useEffect(() => {
        if (activeTab === 'audit') {
            fetchAuditLogs(true);
        } else {
            fetchSystemLogs();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    const handleExport = async (format: 'csv' | 'excel') => {
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });
            params.append('format', format);
            params.append('type', activeTab);

            const res = await fetch(`/api/admin/logs/export?${params.toString()}`);
            if (res.ok) {
                if (format === 'csv') {
                    const text = await res.text();
                    const blob = new Blob([text], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${activeTab}_logs_${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                } else {
                    // For Excel, you might want to use a library like xlsx
                    alert('Excel export will be implemented soon');
                }
            } else {
                const data = await res.json();
                alert(data.error || 'Export failed');
            }
        } catch (e) {
            console.error('Export failed:', e);
            alert('Export failed');
        }
    };

    const clearFilters = () => {
        setFilters({
            entity_type: '',
            action: '',
            user_id: '',
            start_date: '',
            end_date: '',
            level: '',
            error_code: ''
        });
        setPage(1);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">📜 {t('logs.title')}</h1>
                    <p className="text-gray-600 mt-1">{t('logs.subtitle', '"Kim nima qilgan" degan savolga javob')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setFiltersOpen(!filtersOpen)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Filter className="w-4 h-4" />
                        {t('logs.filters')}
                    </button>
                    <div className="relative group">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            <Download className="w-4 h-4" />
                            {t('logs.export')}
                        </button>
                        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                            <button
                                onClick={() => handleExport('csv')}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-50 rounded-t-lg"
                            >
                                CSV
                            </button>
                            <button
                                onClick={() => handleExport('excel')}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-50 rounded-b-lg"
                            >
                                Excel
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Panel */}
            {filtersOpen && (
                <LogsFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    onClear={clearFilters}
                    entityTypes={entityTypes}
                    actions={actions}
                    activeTab={activeTab}
                />
            )}

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab('audit')}
                            className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors ${
                                activeTab === 'audit'
                                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            <Activity className="w-4 h-4" />
                            1️⃣ {t('logs.tabs.audit')}
                        </button>
                        <button
                            onClick={() => setActiveTab('system')}
                            className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors ${
                                activeTab === 'system'
                                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            <Activity className="w-4 h-4" />
                            2️⃣ {t('logs.tabs.system')}
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                        </div>
                    ) : activeTab === 'audit' ? (
                        <AuditLogsTable logs={auditLogs} />
                    ) : (
                        <SystemLogsTable logs={systemLogs} />
                    )}

                    {/* Pagination */}
                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Jami: {total} ta log
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Oldingi
                            </button>
                            <span className="px-4 py-2 text-sm">
                                Sahifa {page} / {Math.ceil(total / limit)}
                            </span>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={page >= Math.ceil(total / limit)}
                                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Keyingi
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

