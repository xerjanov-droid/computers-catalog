import { CategoryService } from '@/services/category.service';
import Link from 'next/link';
import { Plus, Edit, Trash } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
    const categories = await CategoryService.getAll();

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Categories</h1>
                <Link href="/admin/categories/new" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    <Plus className="w-4 h-4" />
                    Add New
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-medium text-gray-500">ID</th>
                            <th className="p-4 font-medium text-gray-500">Name (RU)</th>
                            <th className="p-4 font-medium text-gray-500">Parent ID</th>
                            <th className="p-4 font-medium text-gray-500">Order</th>
                            <th className="p-4 font-medium text-gray-500">Active</th>
                            <th className="p-4 font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {categories.map((cat: any) => (
                            <tr key={cat.id} className="hover:bg-gray-50">
                                <td className="p-4 text-sm text-gray-500">{cat.id}</td>
                                <td className="p-4 font-medium">
                                    <span className="mr-2">{cat.icon}</span>
                                    {cat.name_ru}
                                </td>
                                <td className="p-4 text-sm text-gray-500">
                                    {cat.parent_id || '-'}
                                </td>
                                <td className="p-4 text-sm">{cat.order_index}</td>
                                <td className="p-4 text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs ${cat.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {cat.is_active ? 'Active' : 'Hidden'}
                                    </span>
                                </td>
                                <td className="p-4 text-sm">
                                    <Link href={`/admin/categories/${cat.id}`} className="text-blue-600 hover:underline flex items-center gap-1">
                                        <Edit className="w-4 h-4" /> Edit
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {categories.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-400">
                                    No categories found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
