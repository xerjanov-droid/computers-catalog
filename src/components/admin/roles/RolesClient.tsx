
"use client";

import { useState } from 'react';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { Shield, Users, Edit, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PermissionEditor } from './PermissionEditor';

interface Role {
    id: number;
    name: string;
    slug: string;
    permissions: any;
    user_count: number;
}

export function RolesClient({ initialRoles }: { initialRoles: Role[] }) {
    const { t } = useAdminLanguage();
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const router = useRouter();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('roles.title')}</h1>
                    <p className="text-sm text-gray-500">{t('roles.subtitle')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {initialRoles.map(role => (
                    <div key={role.id} className="bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        {/* Decorative background icon */}
                        <Shield className="absolute -right-6 -bottom-6 w-32 h-32 text-gray-50 opacity-50 group-hover:scale-110 transition-transform" />

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div className="flex items-center gap-1 text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                                    <Users className="w-4 h-4" />
                                    {role.user_count} {t('roles.users_count')}
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-1">{role.name}</h3>
                            <code className="text-xs text-gray-400 font-mono mb-6 block">{role.slug}</code>

                            <div className="flex flex-wrap gap-2 mb-6 h-20 overflow-hidden text-xs text-gray-500">
                                {/* Preview permissions */}
                                {Object.keys(role.permissions).slice(0, 5).map(k => (
                                    <span key={k} className="px-2 py-1 bg-gray-100 rounded border border-gray-200 capitalize">
                                        {k}
                                    </span>
                                ))}
                                {Object.keys(role.permissions).length > 5 && <span>...</span>}
                            </div>

                            <button
                                onClick={() => setEditingRole(role)}
                                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 rounded-xl hover:bg-black transition-colors font-medium text-sm"
                            >
                                <Edit className="w-4 h-4" />
                                {t('common.edit')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {editingRole && (
                <PermissionEditor
                    role={editingRole}
                    onClose={() => setEditingRole(null)}
                    onSuccess={() => {
                        setEditingRole(null);
                        router.refresh();
                    }}
                />
            )}
        </div>
    );
}
