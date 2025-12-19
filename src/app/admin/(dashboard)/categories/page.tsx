import { CategoryService } from '@/services/category.service';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { CategoryTree } from '@/components/admin/CategoryTree';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
    const categories = await CategoryService.getAllAdmin();

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
                    <p className="text-sm text-gray-500">Manage product taxonomy and hierarchy</p>
                </div>
                <Link href="/admin/categories/new" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm">
                    <Plus className="w-5 h-5" />
                    New Category
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <CategoryTree categories={categories} />
            </div>
        </div>
    );
}
