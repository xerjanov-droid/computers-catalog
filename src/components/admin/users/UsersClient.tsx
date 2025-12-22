
"use client";

import { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { Search, Plus, Filter, MoreHorizontal, UserX, UserCheck, Edit, Shield } from 'lucide-react';
import { UserForm } from './UserForm';

interface User {
    id: number;
    full_name: string;
    email: string;
    status: string;
    role_id: number;
    role_name: string;
    last_login?: string;
    created_at: string;
}

interface Role {
    id: number;
    name: string;
}

export function UsersClient({ initialUsers, roles }: { initialUsers: User[], roles: Role[] }) {
    const { t } = useAdminLanguage();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const updateFilter = (key: string, value: string) => {
        const p = new URLSearchParams(searchParams.toString());
        if (value && value !== 'all') p.set(key, value);
        else p.delete(key);
        router.push(`${pathname}?${p.toString()}`);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsFormOpen(true);
    };

    const handleCreate = () => {
        setEditingUser(null);
        setIsFormOpen(true);
    };

    const handleBlock = async (user: User) => {
        const newStatus = user.status === 'active' ? 'blocked' : 'active';
        if (!confirm(`Are you sure you want to ${newStatus} ${user.full_name}?`)) return;

        try {
            await fetch(`/api/admin/users/${user.id}`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus })
            });
            router.refresh();
        } catch (e) {
            alert('Error updating status');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('users.title')}</h1>
                    <p className="text-sm text-gray-500">{t('users.subtitle')}</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus className="w-4 h-4" />
                    {t('common.add_new')}
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 bg-white p-4 rounded-xl border shadow-sm">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={t('common.search')}
                        className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
                        defaultValue={searchParams.get('search') || ''}
                        onKeyDown={e => e.key === 'Enter' && updateFilter('search', e.currentTarget.value)}
                    />
                </div>
                <select
                    className="px-4 py-2 border rounded-lg text-sm bg-white"
                    onChange={e => updateFilter('role_id', e.target.value)}
                    defaultValue={searchParams.get('role_id') || 'all'}
                >
                    <option value="all">{t('filters.all_statuses')}</option> {/* Reusing all statuses placeholder for roles? No create dynamic label */}
                    <option value="all">All Roles</option>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <select
                    className="px-4 py-2 border rounded-lg text-sm bg-white"
                    onChange={e => updateFilter('status', e.target.value)}
                    defaultValue={searchParams.get('status') || 'all'}
                >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                        <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">{t('users.full_name')}</th>
                            <th className="px-6 py-4">{t('users.email')}</th>
                            <th className="px-6 py-4">{t('users.role')}</th>
                            <th className="px-6 py-4">{t('common.status')}</th>
                            <th className="px-6 py-4">{t('users.last_login')}</th>
                            <th className="px-6 py-4 text-right">{t('common.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {initialUsers.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50/50">
                                <td className="px-6 py-4 text-gray-500">#{user.id}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{user.full_name || '-'}</td>
                                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                        <Shield className="w-3 h-3" />
                                        {user.role_name}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${user.status === 'active'
                                            ? 'bg-green-50 text-green-700'
                                            : 'bg-red-50 text-red-700'
                                        }`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {user.last_login ? new Date(user.last_login).toLocaleString() : '-'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className="p-2 text-gray-400 hover:text-blue-600 transition"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleBlock(user)}
                                            className={`p-2 transition ${user.status === 'active' ? 'text-gray-400 hover:text-red-600' : 'text-green-600 hover:text-green-700'}`}
                                            title={user.status === 'active' ? t('users.block') : t('users.unblock')}
                                        >
                                            {user.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Form Modal */}
            {isFormOpen && (
                <UserForm
                    user={editingUser}
                    roles={roles}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={() => {
                        setIsFormOpen(false);
                        router.refresh();
                    }}
                />
            )}
        </div>
    );
}
