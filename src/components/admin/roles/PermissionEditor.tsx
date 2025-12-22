
"use client";

import { useState } from 'react';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { X, Loader2, Lock, Check } from 'lucide-react';

interface Props {
    role: any;
    onClose: () => void;
    onSuccess: () => void;
}

const RESOURCES = [
    'products', 'categories', 'characteristics', 'filters',
    'requests', 'orders', 'users', 'roles', 'settings', 'logs'
];
const ACTIONS = ['view', 'create', 'edit', 'delete'];

export function PermissionEditor({ role, onClose, onSuccess }: Props) {
    const { t } = useAdminLanguage();
    const [loading, setLoading] = useState(false);

    // Initial parsing of permissions
    // Expected format: { "products": ["view", "edit"], ... } or { "all": true }
    // We convert to internal state map
    const [permissions, setPermissions] = useState<Record<string, string[]>>(() => {
        if (role.permissions.all) {
            // If super admin has explicit all=true, we might show all checked or disable.
            // But we will handle logic below.
            return {};
        }
        // Ensure array format
        const p: any = {};
        Object.keys(role.permissions).forEach(key => {
            const val = role.permissions[key];
            if (Array.isArray(val)) p[key] = val;
            else if (val === true) p[key] = [...ACTIONS]; // Map true to all actions
        });
        return p;
    });

    const isSuperAdmin = role.slug === 'super_admin';

    const togglePermission = (resource: string, action: string) => {
        if (isSuperAdmin) return;

        setPermissions(prev => {
            const currentActions = prev[resource] || [];
            if (currentActions.includes(action)) {
                return { ...prev, [resource]: currentActions.filter(a => a !== action) };
            } else {
                return { ...prev, [resource]: [...currentActions, action] };
            }
        });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/roles/${role.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ permissions })
            });
            if (!res.ok) throw new Error('Failed to update permissions');
            onSuccess();
        } catch (error) {
            alert('Error saving permissions');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            {t('roles.permissions')}: {role.name}
                            {isSuperAdmin && <Lock className="w-4 h-4 text-orange-500" />}
                        </h2>
                        {isSuperAdmin && <p className="text-xs text-orange-600 mt-1">Super Admin has full access by default. Cannot be modified.</p>}
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="p-3 border-b-2 border-gray-100 font-bold text-gray-900 w-1/3">Resource / Module</th>
                                {ACTIONS.map(action => (
                                    <th key={action} className="p-3 border-b-2 border-gray-100 font-semibold text-gray-500 capitalize text-center w-1/6">
                                        {action}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {RESOURCES.map(res => (
                                <tr key={res} className="border-b border-gray-50 hover:bg-gray-50/50">
                                    <td className="p-3 font-medium text-gray-700 capitalize">
                                        {t(`nav.${res}`) || res}
                                    </td>
                                    {ACTIONS.map(action => {
                                        const isChecked = isSuperAdmin || (permissions[res] || []).includes(action);
                                        return (
                                            <td key={action} className="p-3 text-center">
                                                <div
                                                    onClick={() => togglePermission(res, action)}
                                                    className={`
                                                        w-6 h-6 mx-auto rounded border flex items-center justify-center transition-all cursor-pointer
                                                        ${isChecked ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300 hover:border-blue-400'}
                                                        ${isSuperAdmin ? 'opacity-50 cursor-not-allowed' : ''}
                                                    `}
                                                >
                                                    {isChecked && <Check className="w-3.5 h-3.5 text-white" />}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 border-t bg-gray-50/50 flex justify-end gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition font-medium"
                    >
                        {t('common.cancel')}
                    </button>
                    {!isSuperAdmin && (
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-black transition font-medium disabled:opacity-50 shadow-lg shadow-gray-200"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {t('roles.save_permissions')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
