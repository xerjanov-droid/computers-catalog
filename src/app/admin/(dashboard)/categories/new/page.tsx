import { CategoryForm } from '@/components/CategoryForm';
import { CategoryService } from '@/services/category.service';

export const dynamic = 'force-dynamic';

export default async function NewCategoryPage() {
    const categories = await CategoryService.getAll();

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Create Category</h1>
            <CategoryForm categories={categories} />
        </div>
    );
}
