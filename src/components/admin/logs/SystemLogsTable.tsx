'use client';

import { AlertCircle, AlertTriangle, Info, Bug } from 'lucide-react';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';

interface SystemLog {
    id: number;
    level: 'error' | 'warn' | 'info' | 'debug';
    message: string;
    context?: Record<string, any>;
    error_code?: string;
    user_id?: number;
    ip_address?: string;
    created_at: Date;
}

interface Props {
    logs: SystemLog[];
}

export function SystemLogsTable({ logs }: Props) {
    const { t } = useAdminLanguage();
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

    const getLevelIcon = (level: string) => {
        switch (level) {
            case 'error':
                return <AlertCircle className="w-4 h-4 text-red-600" />;
            case 'warn':
                return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
            case 'info':
                return <Info className="w-4 h-4 text-blue-600" />;
            default:
                return <Bug className="w-4 h-4 text-gray-600" />;
        }
    };

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'error':
                return 'bg-red-100 text-red-800';
            case 'warn':
                return 'bg-yellow-100 text-yellow-800';
            case 'info':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (logs.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                {t('logs.no_system_logs')}
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Sana</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Level</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Message</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Error Code</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t('logs.table.ip')}</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log) => (
                        <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                                {formatDate(log.created_at)}
                            </td>
                            <td className="px-4 py-3 text-sm">
                                <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getLevelColor(log.level)}`}>
                                    {getLevelIcon(log.level)}
                                    {log.level.toUpperCase()}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 max-w-md">
                                <div className="truncate" title={log.message}>
                                    {log.message}
                                </div>
                                {log.context && Object.keys(log.context).length > 0 && (
                                    <details className="mt-1">
                                        <summary className="text-xs text-gray-500 cursor-pointer">Context</summary>
                                        <pre className="text-xs mt-1 p-2 bg-gray-50 rounded overflow-x-auto">
                                            {JSON.stringify(log.context, null, 2)}
                                        </pre>
                                    </details>
                                )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                                {log.error_code || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 font-mono text-xs">
                                {log.ip_address || '-'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

