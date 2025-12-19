"use client";

import { useState, useMemo } from 'react';
import { Category } from '@/types';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import {
    Plus, Search, MoreVertical, Edit, FolderPlus, Layers,
    Archive, GripVertical, ChevronRight, ChevronDown, Menu, List, Circle, Pin
} from 'lucide-react';
import Link from 'next/link';

interface Props {
    initialCategories: Category[];
}

export function CategoriesClient({ initialCategories }: Props) {
    const { t } = useAdminLanguage();
    // In a real app with DnD, we'd use local state for optimistic updates
    const [categories, setCategories] = useState(initialCategories);
    const [expanded, setExpanded] = useState<Set<number>>(new Set(initialCategories.map(c => c.id))); // Default expand roots
    const [searchTerm, setSearchTerm] = useState('');

    const toggleExpand = (id: number) => {
        const newSet = new Set(expanded);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpanded(newSet);
    };

    // Filter Logic with Auto-Expand
    const filteredCategories = useMemo(() => {
        if (!searchTerm) return categories;

        const lowerTerm = searchTerm.toLowerCase();

        // Deep filter function
        const filterNode = (node: Category): Category | null => {
            const matchesSelf = node.name_ru.toLowerCase().includes(lowerTerm);

            let filteredChildren: Category[] = [];
            if (node.children) {
                const results = node.children.map(filterNode).filter(Boolean) as Category[];
                filteredChildren = results;
            }

            if (matchesSelf || filteredChildren.length > 0) {
                return { ...node, children: filteredChildren };
            }
            return null;
        };

        // Apply to roots
        return categories.map(filterNode).filter(Boolean) as Category[];
    }, [categories, searchTerm]);

    // Auto-expand if searching
    useMemo(() => {
        if (searchTerm) {
            const allIds = new Set<number>();
            const collect = (nodes: Category[]) => {
                nodes.forEach(n => {
                    allIds.add(n.id);
                    if (n.children) collect(n.children);
                });
            };
            collect(filteredCategories);
            setExpanded(allIds);
        }
    }, [searchTerm, filteredCategories]);


    return (
        <div className="space-y-6">
            {/* Header & Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('common.search')}
                            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <Link
                    href="/admin/categories/new"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-sm whitespace-nowrap"
                >
                    <Plus className="w-4 h-4" />
                    {t('common.add_new')}
                </Link>
            </div>

            {/* Tree View Container */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
                <div className="p-4 border-b bg-gray-50 flex text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <div className="flex-1 pl-12">{t('nav.categories')}</div>
                    <div className="w-32 text-center">{t('common.status')}</div>
                    <div className="w-16 text-right pr-4">{t('common.actions')}</div>
                </div>

                <div className="divide-y divide-gray-100">
                    {filteredCategories.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">No categories found.</div>
                    ) : (
                        filteredCategories.map(category => (
                            <TreeNode
                                key={category.id}
                                node={category}
                                level={0}
                                expanded={expanded}
                                onToggle={toggleExpand}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function TreeNode({ node, level, expanded, onToggle }: any) {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expanded.has(node.id);
    const [showActions, setShowActions] = useState(false);

    // Visual styles for Parent vs Child
    const isRoot = level === 0;
    const rowClass = isRoot ? "bg-white hover:bg-gray-50" : "bg-white hover:bg-gray-50";
    const textClass = isRoot ? "font-bold text-gray-900" : "font-medium text-gray-600";
    const iconColor = isRoot ? "text-gray-400" : "text-gray-300";

    return (
        <div className="group transition-colors">
            {/* Main Row */}
            <div className={`flex items-center py-3 text-sm border-b border-gray-50 ${rowClass}`}>

                {/* Name & Indent */}
                <div className="flex-1 flex items-center pl-4 overflow-hidden">
                    {/* Indentation Spacer */}
                    <div style={{ width: `${level * 32}px` }} className="flex-shrink-0 relative">
                        {/* Thread line visual could go here */}
                    </div>

                    {/* Controls Config */}
                    <div className="flex items-center gap-1 mr-2 flex-shrink-0">
                        {/* Drag Handle (Hidden if using List icon as handle concept, but keeping for DnD logic later) */}
                        {/* <button className={`p-1 cursor-move ${iconColor} hover:text-gray-600`} title="Drag to reorder">
                            <Menu className="w-4 h-4" />
                        </button> */}

                        {/* Expand/Collapse */}
                        <button
                            onClick={() => onToggle(node.id)}
                            className={`p-1 rounded hover:bg-gray-200 text-gray-400 transition-transform ${!hasChildren ? 'invisible' : ''}`}
                        >
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex items-center gap-3 truncate">
                        {/* Level Icon */}
                        <div className="text-gray-400">
                            {level < 2 ? <List className="w-4 h-4" /> : <div className="w-1.5 h-1.5 rounded-full bg-gray-300 ml-1.5"></div>}
                        </div>

                        <span className={`${textClass} truncate`}>{node.name_ru}</span>
                        <span className="text-xs text-gray-400 font-mono">({node.product_count})</span>
                    </div>
                </div>

                {/* Status */}
                <div className="w-32 text-center flex-shrink-0">
                    {node.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Inactive
                        </span>
                    )}
                </div>

                {/* Actions */}
                <div className="w-16 text-right pr-4 relative flex-shrink-0">
                    <button
                        onClick={() => setShowActions(!showActions)}
                        onBlur={() => setTimeout(() => setShowActions(false), 200)}
                        className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </button>

                    {showActions && (
                        <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden text-left py-1 animate-in fade-in zoom-in-95 duration-100">
                            <Link href={`/admin/categories/${node.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700 text-sm">
                                <Edit className="w-4 h-4 text-gray-400" /> Edit
                            </Link>
                            {isRoot && (
                                <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700 text-sm">
                                    <FolderPlus className="w-4 h-4 text-gray-400" /> Add Subcategory
                                </button>
                            )}
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700 text-sm">
                                <Layers className="w-4 h-4 text-gray-400" /> Assign Attributes
                            </button>
                            <div className="h-px bg-gray-100 my-1"></div>
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-red-600 text-sm">
                                <Archive className="w-4 h-4 opacity-75" /> Archive
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Children Recursive Render */}
            {isExpanded && node.children && (
                <div>
                    {node.children.map((child: any) => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            level={level + 1}
                            expanded={expanded}
                            onToggle={onToggle}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
