-- Check categories with missing or identical translations
SELECT id, name_en, name_ru, name_uz, slug
FROM categories
WHERE name_ru IS NULL 
   OR name_uz IS NULL 
   OR name_ru = name_en 
   OR name_uz = name_en
   OR name_ru = ''
   OR name_uz = ''
ORDER BY id
LIMIT 20;

-- Show sample of all categories
SELECT id, name_en, name_ru, name_uz, slug, parent_id
FROM categories
ORDER BY id
LIMIT 10;

-- Statistics
SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN name_ru IS NULL OR name_ru = '' THEN 1 END) as missing_ru,
    COUNT(CASE WHEN name_uz IS NULL OR name_uz = '' THEN 1 END) as missing_uz,
    COUNT(CASE WHEN name_ru = name_en THEN 1 END) as ru_same_as_en,
    COUNT(CASE WHEN name_uz = name_en THEN 1 END) as uz_same_as_en
FROM categories;

