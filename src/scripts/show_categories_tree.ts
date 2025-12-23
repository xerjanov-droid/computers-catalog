import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const client = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

interface Category {
    id: number;
    parent_id: number | null;
    slug: string;
    name_en: string;
    name_ru: string;
    name_uz: string;
    order_index: number;
    is_active: boolean;
}

function printCategoryTree(categories: Category[], parentId: number | null = null, prefix: string = '', isLast: boolean = true) {
    const children = categories
        .filter(c => c.parent_id === parentId)
        .sort((a, b) => a.order_index - b.order_index);

    children.forEach((category, index) => {
        const isLastChild = index === children.length - 1;
        const currentPrefix = isLast ? '└── ' : '├── ';
        const nextPrefix = isLast ? '    ' : '│   ';

        // Show category info
        const status = category.is_active ? '✓' : '✗';
        const translationStatus = 
            category.name_ru === category.name_en && category.name_uz === category.name_en 
                ? '⚠️' 
                : '✓';

        console.log(`${prefix}${currentPrefix}[${category.id}] ${category.name_en} (${category.slug}) ${status} ${translationStatus}`);
        console.log(`${prefix}${nextPrefix}    EN: ${category.name_en}`);
        console.log(`${prefix}${nextPrefix}    RU: ${category.name_ru}${category.name_ru === category.name_en ? ' ⚠️' : ''}`);
        console.log(`${prefix}${nextPrefix}    UZ: ${category.name_uz}${category.name_uz === category.name_en ? ' ⚠️' : ''}`);

        // Recursively print children
        if (categories.some(c => c.parent_id === category.id)) {
            printCategoryTree(categories, category.id, prefix + nextPrefix, isLastChild);
        }
    });
}

async function showCategoriesTree() {
    console.log('=== Kategoriyalar va Subkategoriyalar Daraxti ===\n');
    
    try {
        await client.connect();
        console.log('✅ Database\'ga ulandi\n');

        const result = await client.query<Category>(`
            SELECT id, parent_id, slug, name_en, name_ru, name_uz, order_index, is_active
            FROM categories
            ORDER BY order_index, id
        `);

        const categories = result.rows;

        // Statistics
        const total = categories.length;
        const roots = categories.filter(c => c.parent_id === null).length;
        const withTranslations = categories.filter(c => 
            c.name_ru !== c.name_en && c.name_uz !== c.name_en
        ).length;
        const active = categories.filter(c => c.is_active).length;

        console.log(`📊 Statistika:`);
        console.log(`   Jami kategoriyalar: ${total}`);
        console.log(`   Asosiy kategoriyalar (root): ${roots}`);
        console.log(`   Subkategoriyalar: ${total - roots}`);
        console.log(`   Faol kategoriyalar: ${active}`);
        console.log(`   To'g'ri tarjima qilingan: ${withTranslations}`);
        console.log(`   Tarjima kerak: ${total - withTranslations}`);
        console.log('\n' + '='.repeat(80) + '\n');

        // Print tree
        printCategoryTree(categories);

        console.log('\n' + '='.repeat(80));
        console.log('\n📝 Izohlar:');
        console.log('   ✓ - Faol kategoriya');
        console.log('   ✗ - Nofaol kategoriya');
        console.log('   ⚠️ - Tarjima EN bilan bir xil (tarjima kerak)');
        console.log('   ✓ - To\'g\'ri tarjima qilingan');

    } catch (e) {
        console.error('❌ Xatolik:', e);
    } finally {
        await client.end();
    }
}

showCategoriesTree();

