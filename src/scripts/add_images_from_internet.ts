import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import https from 'https';
import http from 'http';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Unsplash API (bepul, lekin API key kerak)
// Yoki oddiyroq yondashuv - kategoriya asosida placeholder rasmlar
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || '';
const USE_UNSPLASH = !!UNSPLASH_ACCESS_KEY;

// Kategoriya asosida default rasmlar
const categoryDefaultImages: { [key: string]: string } = {
    'computers': '/images/case.png',
    'laptops': '/images/notebook.png',
    'monitors': '/images/monitor.png',
    'components': '/images/case.png',
    'peripherals': '/images/case.png',
    'networking': '/images/case.png',
    'accessories': '/images/case.png',
    'software': '/images/case.png',
    'storage_devices': '/images/case.png', // Storage devices uchun ham default rasm
};

// Rasmlarni yuklab olish funksiyasi
function downloadImage(url: string, filepath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        
        protocol.get(url, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                // Redirect
                return downloadImage(response.headers.location!, filepath)
                    .then(resolve)
                    .catch(reject);
            }
            
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download: ${response.statusCode}`));
                return;
            }
            
            const fileStream = fs.createWriteStream(filepath);
            response.pipe(fileStream);
            
            fileStream.on('finish', () => {
                fileStream.close();
                resolve();
            });
            
            fileStream.on('error', reject);
        }).on('error', reject);
    });
}

// Unsplash API dan rasm qidirish
async function searchImageFromUnsplash(query: string): Promise<string | null> {
    if (!USE_UNSPLASH) return null;
    
    try {
        const searchUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&client_id=${UNSPLASH_ACCESS_KEY}`;
        const response = await fetch(searchUrl);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            return data.results[0].urls.small || data.results[0].urls.thumb;
        }
    } catch (e) {
        console.error('Unsplash API error:', e);
    }
    
    return null;
}

// Pexels API dan rasm qidirish (alternativ)
async function searchImageFromPexels(query: string): Promise<string | null> {
    const PEXELS_API_KEY = process.env.PEXELS_API_KEY || '';
    if (!PEXELS_API_KEY) return null;
    
    try {
        const searchUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`;
        const response = await fetch(searchUrl, {
            headers: {
                'Authorization': PEXELS_API_KEY
            }
        });
        const data = await response.json();
        
        if (data.photos && data.photos.length > 0) {
            return data.photos[0].src.small || data.photos[0].src.tiny;
        }
    } catch (e) {
        console.error('Pexels API error:', e);
    }
    
    return null;
}

async function addImagesFromInternet() {
    const client = await pool.connect();
    
    try {
        console.log('🔍 Rasmi yo\'q mahsulotlar topilmoqda...\n');

        // Rasmi yo'q mahsulotlarni topish
        const productsRes = await client.query(`
            SELECT 
                p.id,
                p.category_id,
                p.brand,
                p.model,
                p.title_ru,
                p.title_uz,
                p.title_en,
                c.name_ru as category_name_ru,
                c.name_uz as category_name_uz,
                c.slug as category_slug,
                pc.name_ru as parent_category_name_ru,
                pc.slug as parent_category_slug
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN categories pc ON c.parent_id = pc.id
            WHERE NOT EXISTS (
                SELECT 1 FROM products_images pi WHERE pi.product_id = p.id
            )
            ORDER BY p.id
        `);

        const products = productsRes.rows;

        if (products.length === 0) {
            console.log('✅ Barcha mahsulotlarda rasm mavjud.');
            return;
        }

        console.log(`📦 Rasmi yo'q mahsulotlar: ${products.length} ta\n`);

        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;

        // Public/images/products papkasini yaratish
        const imagesDir = path.join(process.cwd(), 'public', 'images', 'products');
        if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir, { recursive: true });
        }

        for (const product of products) {
            try {
                // Qidirish so'rovi yaratish
                const searchQuery = `${product.brand} ${product.model} ${product.title_ru}`.trim();
                const categoryQuery = product.parent_category_name_ru || product.category_name_ru || 'computer';
                
                console.log(`\n📝 ${product.title_ru} (ID: ${product.id})`);
                console.log(`   Qidirish: "${searchQuery}"`);

                let imageUrl: string | null = null;

                // 1. Avval kategoriya asosida default rasm tekshirish
                const parentSlug = product.parent_category_slug || product.category_slug;
                
                // Parent kategoriya slug'i bo'yicha
                if (parentSlug && categoryDefaultImages[parentSlug]) {
                    imageUrl = categoryDefaultImages[parentSlug];
                    console.log(`   ✅ Parent kategoriya default rasm: ${imageUrl}`);
                } 
                // Subkategoriya slug'i bo'yicha
                else if (product.category_slug && categoryDefaultImages[product.category_slug]) {
                    imageUrl = categoryDefaultImages[product.category_slug];
                    console.log(`   ✅ Subkategoriya default rasm: ${imageUrl}`);
                }
                // "storage-devices" yoki "storage_devices" uchun
                else if (parentSlug === 'storage-devices' || parentSlug === 'storage_devices') {
                    imageUrl = '/images/case.png';
                    console.log(`   ✅ Storage devices default rasm: ${imageUrl}`);
                }
                // Boshqa hollarda umumiy default rasm
                else {
                    imageUrl = '/images/case.png';
                    console.log(`   ✅ Umumiy default rasm: ${imageUrl}`);
                }
                
                // 2. Internetdan qidirish (agar API key mavjud bo'lsa)
                if (USE_UNSPLASH) {
                    const internetImage = await searchImageFromUnsplash(searchQuery);
                    if (internetImage) {
                        imageUrl = internetImage;
                        console.log(`   ✅ Unsplash dan topildi`);
                    }
                }
                
                // 3. Pexels dan qidirish (agar Unsplash ishlamasa)
                if (!imageUrl || imageUrl === '/images/case.png') {
                    const pexelsImage = await searchImageFromPexels(searchQuery);
                    if (pexelsImage) {
                        imageUrl = pexelsImage;
                        console.log(`   ✅ Pexels dan topildi`);
                    }
                }
                
                // 4. Agar hali ham topilmasa, kategoriya asosida qidirish
                if ((!imageUrl || imageUrl === '/images/case.png') && USE_UNSPLASH) {
                    const categoryImage = await searchImageFromUnsplash(categoryQuery);
                    if (categoryImage) {
                        imageUrl = categoryImage;
                        console.log(`   ✅ Kategoriya bo'yicha Unsplash dan topildi`);
                    }
                }

                if (!imageUrl) {
                    console.log(`   ⚠️  Rasm topilmadi, o'tkazib yuborildi`);
                    skipCount++;
                    continue;
                }

                // Agar internetdan yuklab olingan bo'lsa, local'ga saqlash
                let finalImageUrl = imageUrl;
                
                if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                    // Internetdan yuklab olish
                    const filename = `product_${product.id}_${Date.now()}.jpg`;
                    const filepath = path.join(imagesDir, filename);
                    
                    try {
                        await downloadImage(imageUrl, filepath);
                        finalImageUrl = `/images/products/${filename}`;
                        console.log(`   💾 Rasm yuklab olindi: ${finalImageUrl}`);
                    } catch (e: any) {
                        console.log(`   ⚠️  Rasm yuklab olinmadi: ${e.message}`);
                        skipCount++;
                        continue;
                    }
                }

                // Database'ga yozish
                await client.query(`
                    INSERT INTO products_images (product_id, image_url, is_cover, order_index)
                    VALUES ($1, $2, true, 0)
                `, [product.id, finalImageUrl]);

                console.log(`   ✅ Rasm qo'shildi: ${finalImageUrl}`);
                successCount++;

                // API limitlarini e'tiborga olish (1 soniya kutish)
                if (USE_UNSPLASH && successCount % 10 === 0) {
                    console.log('   ⏸️  API limit uchun 2 soniya kutilyapti...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }

            } catch (e: any) {
                console.error(`   ❌ Xatolik: ${e.message}`);
                errorCount++;
            }
        }

        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('📊 NATIJA');
        console.log('═══════════════════════════════════════════════════════════════\n');
        console.log(`✅ Muvaffaqiyatli qo'shildi: ${successCount} ta`);
        console.log(`⏭️  O'tkazib yuborildi: ${skipCount} ta`);
        if (errorCount > 0) {
            console.log(`❌ Xatoliklar: ${errorCount} ta`);
        }
        console.log(`📦 Jami mahsulotlar: ${products.length} ta`);

        if (!USE_UNSPLASH && successCount === 0) {
            console.log('\n💡 Eslatma: Internetdan rasm qidirish uchun API key kerak.');
            console.log('   .env fayliga qo\'shing:');
            console.log('   UNSPLASH_ACCESS_KEY=your_key_here');
            console.log('   yoki');
            console.log('   PEXELS_API_KEY=your_key_here');
            console.log('\n   Yoki kategoriya default rasmlaridan foydalanish mumkin.');
        }

    } catch (e) {
        console.error('\n❌ Xatolik:', e);
        throw e;
    } finally {
        client.release();
        await pool.end();
    }
}

addImagesFromInternet();

