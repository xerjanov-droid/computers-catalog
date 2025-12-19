"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronDown, Edit, Folder, File } from 'lucide-react';
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
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});

    // Toggle expand/collapse
    const toggle = (id: number) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
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
    const renderNode = (node: TreeNode) => {
        const hasChildren = node.children.length > 0;
        const isExpanded = expanded[node.id];

        // Indentation padding
        const paddingLeft = `${node.level * 24 + 12}px`;

        // Get Name based on selected language
        // Explicitly cast to any or use helper if types not updated yet
        // Assuming Category type has name_ru, name_uz, name_en based on usage
        const langKey = `name_${language}` as keyof Category;
        const displayName = node[langKey] || node.name_ru || node.name_en || 'No Name';

        return (
            <>
                <tr key={node.id} className="hover:bg-gray-50 border-b last:border-b-0 group transition-colors">
                    {/* Name Column with Tree Toggle */}
                    <td className="py-3 pr-4" style={{ paddingLeft }}>
                        <div className="flex items-center gap-2">
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

                            <span className="font-medium text-gray-900 text-sm">
                                {displayName}
                            </span>
                        </div>
                    </td>

                    {/* Slug */}
                    <td className="py-3 px-4 text-xs font-mono text-gray-500">
                        {node.slug}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${node.is_active
                                ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                                : 'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10'
                            }`}>
                            {node.is_active ? t('categories.active') : 'Inactive'}
                        </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                        <th className="py-3 px-4 font-semibold">{t('categories.active')}</th>
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
