
import { CategoryService } from '@/services/category.service';
import { CategoriesClient } from '@/components/admin/categories/CategoriesClient';

export default async function CategoriesPage() {
    // Service already returns the tree structure
    const categories = await CategoryService.getAll();

    return (
        <CategoriesClient initialCategories={categories} />
    );
}
