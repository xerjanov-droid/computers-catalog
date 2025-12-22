"use client";

import React from 'react';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronDown, Edit, Folder, File, Power, Loader2 } from 'lucide-react';
import { Category } from '@/types';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';

interface TreeNode extends Category {
    children: TreeNode[];
    level: number;
}

interface CategoryTreeProps {
    categories: Category[];
}

export function CategoryTree({ categories }: CategoryTreeProps) {
    const { language, t } = useAdminLanguage();
    const router = useRouter();
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});
    const [loadingId, setLoadingId] = useState<number | null>(null);

    // Toggle expand/collapse
    const toggle = (id: number) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        if (loadingId) return;
        try {
            setLoadingId(id);
            const res = await fetch(`/api/admin/categories/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: !currentStatus })
            });

            if (!res.ok) throw new Error('Failed to update status');
            router.refresh();
        } catch (error) {
            console.error('Status toggle failed', error);
            alert('Failed to update status');
        } finally {
            setLoadingId(null);
        }
    };

    // Build Tree
    const tree = useMemo(() => {
        const buildTree = (parentId: number | null = null, level = 0): TreeNode[] => {
            return categories
                .filter(c => c.parent_id === parentId) // Find children of current parent
                .sort((a, b) => (a.order_index || 0) - (b.order_index || 0)) // Sort by order
                .map(node => ({
                    ...node,
                    level,
                    children: buildTree(node.id, level + 1) // Recursion
                }));
        };
        return buildTree(null, 0); // Start from root (parent_id = null)
    }, [categories]);

    // Recursive Renderer
    const renderNode = (node: TreeNode): React.ReactElement => {
        const hasChildren = node.children.length > 0;
        const isExpanded = expanded[node.id];
        const isLoading = loadingId === node.id;
        const isInactive = !node.is_active;

        // Indentation padding
        const paddingLeft = `${node.level * 24 + 12}px`;

        const langKey = `name_${language}` as keyof Category;
        const displayName = (node as any)[langKey] || node.name_ru || node.name_en || 'No Name';

        return (
            <>
                <tr key={node.id} className={`hover:bg-gray-50 border-b last:border-b-0 group transition-colors ${isInactive ? 'bg-gray-50/80' : ''}`}>
                    {/* Name Column with Tree Toggle */}
                    <td className="py-3 pr-4" style={{ paddingLeft }}>
                        <div className={`flex items-center gap-2 ${isInactive ? 'opacity-60 grayscale' : ''}`}>
                            {hasChildren ? (
                                <button
                                    onClick={() => toggle(node.id)}
                                    className="p-1 rounded hover:bg-gray-200 text-gray-500 transition-colors"
                                >
                                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </button>
                            ) : (
                                <span className="w-6" /> // Spacer
                            )}

                            <span className={`text-gray-400 ${hasChildren ? 'text-blue-400' : ''}`}>
                                {hasChildren ? <Folder size={18} className="fill-blue-50" /> : <File size={16} />}
                            </span>

                            <span className={`font-medium text-sm ${isInactive ? 'text-gray-500 italic' : 'text-gray-900'}`}>
                                {displayName}
                            </span>
                        </div>
                    </td>

                    {/* Slug */}
                    <td className="py-3 px-4 text-xs font-mono text-gray-400">
                        {node.slug}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                        <button
                            onClick={() => handleToggleStatus(node.id, !!node.is_active)}
                            disabled={!!loadingId}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all
                                ${node.is_active
                                    ? 'bg-green-50 text-green-700 hover:bg-green-100 ring-1 ring-inset ring-green-600/20'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 ring-1 ring-inset ring-gray-500/10'
                                } ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {isLoading ? (
                                <Loader2 size={12} className="animate-spin" />
                            ) : (
                                <span className={`w-1.5 h-1.5 rounded-full ${node.is_active ? 'bg-green-600' : 'bg-gray-500'}`} />
                            )}
                            {node.is_active ? 'Active' : 'Inactive'}
                        </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => handleToggleStatus(node.id, !!node.is_active)}
                                className={`p-1.5 rounded transition-colors ${node.is_active ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                                title={node.is_active ? "Disable" : "Enable"}
                            >
                                <Power size={16} />
                            </button>
                            <Link
                                href={`/admin/categories/${node.id}`}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Edit"
                            >
                                <Edit size={16} />
                            </Link>
                        </div>
                    </td>
                </tr>

                {/* Render Children (Recursion) */}
                {isExpanded && node.children.map(child => renderNode(child))}
            </>
        );
    };

    if (categories.length === 0) {
        return <div className="p-8 text-center text-gray-500">No categories found.</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b bg-gray-50/50 text-xs uppercase tracking-wider text-gray-500">
                        <th className="py-3 pl-4 font-semibold w-[50%]">{t('categories.name')}</th>
                        <th className="py-3 px-4 font-semibold">{t('categories.slug')}</th>
                        <th className="py-3 px-4 font-semibold">{t('categories.status')}</th>
                        <th className="py-3 px-4 font-semibold text-right">{t('categories.actions')}</th>
                    </tr>
                </thead>
                <tbody className="bg-white text-sm">
                    {tree.map(rootNode => renderNode(rootNode))}
                </tbody>
            </table>
        </div>
    );
}
