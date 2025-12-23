'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';

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
    logs: AuditLog[];
}

export function AuditLogsTable({ logs }: Props) {
    const { t } = useAdminLanguage();
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    const toggleRow = (logId: number) => {
        setExpandedRows(prev => {
            const next = new Set(prev);
            if (next.has(logId)) {
                next.delete(logId);
            } else {
                next.add(logId);
            }
            return next;
        });
    };

    const formatDate = (date: Date | string) => {
        try {
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            const seconds = String(d.getSeconds()).padStart(2, '0');
            return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
        } catch {
            return String(date);
        }
    };

    if (logs.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                {t('logs.no_logs')}
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Sana</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Object</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Old value</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">New value</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log) => (
                        <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                                {formatDate(log.created_at)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                                {log.user_name || log.user_email || `ID: ${log.admin_user_id}` || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                    {log.action}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                                <span className="font-medium">{log.entity_type}</span>
                                {log.entity_id && <span className="text-gray-500"> #{log.entity_id}</span>}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                                <ValueCell data={log.before_data} logId={log.id} isExpanded={expandedRows.has(log.id)} onToggle={() => toggleRow(log.id)} />
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                                <ValueCell data={log.after_data} logId={log.id} isExpanded={expandedRows.has(log.id)} onToggle={() => toggleRow(log.id)} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function ValueCell({ data, logId, isExpanded, onToggle }: { data: any; logId: number; isExpanded: boolean; onToggle: () => void }) {
    const formatted = formatData(data);
    
    if (!formatted.full || formatted.summary === formatted.full) {
        return (
            <div className="text-xs break-words">
                <pre className="whitespace-pre-wrap font-mono">{formatted.summary}</pre>
            </div>
        );
    }
    
    return (
        <div className="text-xs">
            <button
                onClick={onToggle}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mb-1"
            >
                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                <span>{formatted.summary}</span>
            </button>
            {isExpanded && (
                <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                    {formatted.type === 'settings' && formatted.full ? (
                        <div className="space-y-1">
                            {formatted.full.map((item: any, idx: number) => (
                                <div key={idx} className="text-xs">
                                    <span className="font-semibold text-gray-700">{item.key}:</span>{' '}
                                    <span className="text-gray-600">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <pre className="whitespace-pre-wrap font-mono text-xs overflow-x-auto">
                            {JSON.stringify(formatted.full, null, 2)}
                        </pre>
                    )}
                </div>
            )}
        </div>
    );
}

function formatData(data: any) {
    if (!data) return { summary: '-', full: null };
    
    // Handle string data
    let parsed: any;
    if (typeof data === 'string') {
        try {
            parsed = JSON.parse(data);
        } catch {
            return { summary: data, full: data };
        }
    } else {
        parsed = data;
    }
    
    // Special handling for settings updates
    if (parsed && typeof parsed === 'object' && 'updates' in parsed && Array.isArray(parsed.updates)) {
        const updates = parsed.updates;
        if (updates.length === 0) return { summary: '-', full: null };
        
        // Create summary
        const summary = `${updates.length} ta sozlama o'zgartirildi`;
        
        // Create full formatted list
        const full = updates.map((u: any) => {
            const key = u.key || 'unknown';
            let value = u.value;
            if (typeof value === 'object') {
                value = JSON.stringify(value, null, 2);
            }
            return { key, value: String(value) };
        });
        
        return { summary, full, type: 'settings' };
    }
    
    // For simple objects
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const keys = Object.keys(parsed);
        if (keys.length === 0) return { summary: '{}', full: null };
        
        if (keys.length <= 3) {
            // Small object - show all in summary
            const summary = keys.map(key => {
                let val = parsed[key];
                if (typeof val === 'object') {
                    val = JSON.stringify(val);
                }
                if (typeof val === 'string' && val.length > 30) {
                    val = val.substring(0, 30) + '...';
                }
                return `${key}: ${val}`;
            }).join(', ');
            return { summary, full: parsed };
        } else {
            // Large object - show count
            return { summary: `${keys.length} ta maydon`, full: parsed };
        }
    }
    
    // For arrays
    if (Array.isArray(parsed)) {
        if (parsed.length === 0) return { summary: '[]', full: null };
        if (parsed.length <= 3) {
            return { summary: JSON.stringify(parsed), full: parsed };
        }
        return { summary: `[${parsed.length} ta element]`, full: parsed };
    }
    
    // For simple values
    if (typeof parsed === 'string' || typeof parsed === 'number' || typeof parsed === 'boolean') {
        const str = String(parsed);
        if (str.length > 100) {
            return { summary: str.substring(0, 100) + '...', full: str };
        }
        return { summary: str, full: null };
    }
    
    // Fallback to formatted JSON
    try {
        const jsonStr = JSON.stringify(parsed, null, 2);
        if (jsonStr.length > 200) {
            return { summary: jsonStr.substring(0, 200) + '...', full: parsed };
        }
        return { summary: jsonStr, full: parsed };
    } catch {
        return { summary: String(parsed), full: null };
    }
}

