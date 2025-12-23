-- Update category translations
-- This is a template - update with actual translations

-- Example translations (update these with correct translations):
UPDATE categories SET name_ru = 'Компьютеры', name_uz = 'Kompyuterlar' WHERE slug = 'computers';
UPDATE categories SET name_ru = 'Офисные ПК', name_uz = 'Ofis kompyuterlari' WHERE slug = 'office-pc';
UPDATE categories SET name_ru = 'Игровые ПК', name_uz = 'O\'yin kompyuterlari' WHERE slug = 'gaming-pc';
UPDATE categories SET name_ru = 'Рабочие станции', name_uz = 'Ish stantsiyalari' WHERE slug = 'workstations';
UPDATE categories SET name_ru = 'Мини ПК', name_uz = 'Mini kompyuterlar' WHERE slug = 'mini-pc';
UPDATE categories SET name_ru = 'Ноутбуки', name_uz = 'Noutbuklar' WHERE slug = 'laptops';
UPDATE categories SET name_ru = 'Офисные ноутбуки', name_uz = 'Ofis noutbuklari' WHERE slug = 'office-laptops';
UPDATE categories SET name_ru = 'Игровые ноутбуки', name_uz = 'O\'yin noutbuklari' WHERE slug = 'gaming-laptops';
UPDATE categories SET name_ru = 'Ультрабуки', name_uz = 'Ultrabuklar' WHERE slug = 'ultrabooks';
UPDATE categories SET name_ru = 'Мониторы', name_uz = 'Monitorlar' WHERE slug = 'monitors';
UPDATE categories SET name_ru = 'Офисные мониторы', name_uz = 'Ofis monitorlari' WHERE slug = 'office-monitors';
UPDATE categories SET name_ru = 'Игровые мониторы', name_uz = 'O\'yin monitorlari' WHERE slug = 'gaming-monitors';
UPDATE categories SET name_ru = 'Сверхширокие', name_uz = 'Ultra keng' WHERE slug = 'ultrawide-monitors';
UPDATE categories SET name_ru = 'Компоненты', name_uz = 'Komponentlar' WHERE slug = 'components';
UPDATE categories SET name_ru = 'Процессоры', name_uz = 'Protsessorlar' WHERE slug = 'cpu';
UPDATE categories SET name_ru = 'Видеокарты', name_uz = 'Video kartalar' WHERE slug = 'gpu';
UPDATE categories SET name_ru = 'Материнские платы', name_uz = 'Ana kartalar' WHERE slug = 'motherboards';
UPDATE categories SET name_ru = 'Оперативная память', name_uz = 'Operativ xotira' WHERE slug = 'ram';
UPDATE categories SET name_ru = 'Блоки питания', name_uz = 'Quvvat manbalari' WHERE slug = 'psu';
UPDATE categories SET name_ru = 'Охлаждение', name_uz = 'Sovutish' WHERE slug = 'cooling';

-- Check results
SELECT id, slug, name_en, name_ru, name_uz 
FROM categories 
WHERE name_ru = name_en OR name_uz = name_en
ORDER BY id;

