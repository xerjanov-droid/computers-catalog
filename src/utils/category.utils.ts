import { Category } from '@/types';

export type SupportedLanguage = 'ru' | 'uz' | 'en';

/**
 * Get category name in the specified language
 * @param category - Category object with language fields
 * @param lang - Target language (ru, uz, en)
 * @returns Category name in the specified language, with fallback to Russian
 */
export function getCategoryName(
    category: Category | null | undefined,
    lang: SupportedLanguage
): string {
    if (!category) return '';

    // Try to get name in the specified language
    const nameField = `name_${lang}` as keyof Category;
    const name = category[nameField] as string | undefined;

    // Fallback to Russian if the requested language is not available
    if (name) return name;
    if (category.name_ru) return category.name_ru;
    
    // Last resort fallbacks
    if (category.name_uz) return category.name_uz;
    if (category.name_en) return category.name_en;
    
    return '';
}

/**
 * Get category name using all available language fields
 * Returns an object with all language variants
 */
export function getCategoryNames(category: Category | null | undefined): {
    ru: string;
    uz: string;
    en: string;
} {
    if (!category) {
        return { ru: '', uz: '', en: '' };
    }

    return {
        ru: category.name_ru || '',
        uz: category.name_uz || category.name_ru || '',
        en: category.name_en || category.name_ru || '',
    };
}

