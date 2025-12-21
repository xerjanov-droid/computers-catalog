
import { CategoryService } from '@/services/category.service';
import { CharacteristicsClient } from '@/components/admin/characteristics/CharacteristicsClient';

export default async function CharacteristicsPage() {
    // Fetch categories tree for selection
    const categories = await CategoryService.getTree();

    return (
        <CharacteristicsClient initialCategories={categories} />
    );
}
