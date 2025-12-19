
import { notFound } from 'next/navigation';
import { CategoryService } from '@/services/category.service';
import { CharacteristicService } from '@/services/characteristic.service';
import { CategoryForm } from '@/components/admin/categories/form/CategoryForm';

interface Props {
    params: {
        id: string;
    }
}

export default async function EditCategoryPage({ params }: Props) {
    const id = parseInt(params.id);
    if (isNaN(id)) notFound();

    // Fetch Data
    const category = await CategoryService.getById(id);
    if (!category) notFound();

    const [allCategories, allCharacteristics, linkedCharacteristics] = await Promise.all([
        CategoryService.getAll(),
        CharacteristicService.getAll(),
        CategoryService.getCategoryCharacteristics(id)
    ]);

    // Parent candidates should exclude self and children to avoid cycles
    // For simplicity, we just filter out self for now. A robust solution would filter subtree.
    const parents = allCategories.filter(c => c.id !== id);

    return (
        <CategoryForm
            category={category}
            parents={parents}
            allCharacteristics={allCharacteristics}
            linkedCharacteristics={linkedCharacteristics}
        />
    );
}
