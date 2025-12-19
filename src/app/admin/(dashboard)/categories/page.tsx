
import { CategoryService } from '@/services/category.service';
import { CategoriesClient } from '@/components/admin/categories/CategoriesClient';

export default async function CategoriesPage() {
    // Service already returns the tree structure
    // Fetch the strict tree structure as requested
    const categories = await CategoryService.getTree();

    return (
        <CategoriesClient initialCategories={categories} />
    );
}
