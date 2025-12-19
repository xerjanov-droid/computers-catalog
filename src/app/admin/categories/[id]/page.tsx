import { CategoryForm } from '@/components/CategoryForm';
import { CategoryService } from '@/services/category.service';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EditCategoryPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const categories = await CategoryService.getAll();
    const category = categories.find((c: any) => c.id === Number(id));

    if (!category) {
        notFound();
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Edit Category</h1>
            <CategoryForm initialData={category} categories={categories} />
        </div>
    );
}
