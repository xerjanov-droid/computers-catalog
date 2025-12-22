
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// 1. GLOBAL CHARACTERISTICS DICTIONARY (STRICT)
// Using keys that map to User's Labels.
const CHARACTERISTICS: Record<string, { uz: string, ru: string, en: string, type?: string }> = {
    // GENERAL
    "cpu": { uz: "Protsessor (CPU)", ru: "Процессор (CPU)", en: "Processor (CPU)", type: "text" },
    "ram": { uz: "Operativ xotira (RAM)", ru: "Оперативная память (RAM)", en: "RAM", type: "text" },
    "storage_type": { uz: "Xotira turi (SSD / HDD)", ru: "Тип накопителя (SSD / HDD)", en: "Storage Type (SSD / HDD)", type: "text" },
    "storage": { uz: "Xotira (SSD)", ru: "Накопитель (SSD)", en: "Storage (SSD)", type: "text" }, // Simplified generic
    "ssd_capacity": { uz: "SSD hajmi", ru: "Объем SSD", en: "SSD Capacity", type: "text" },

    "screen_size": { uz: "Ekran o‘lchami", ru: "Размер экрана", en: "Screen Size", type: "text" },
    "resolution": { uz: "Ekran ruxsati", ru: "Разрешение экрана", en: "Screen Resolution", type: "text" },
    "resolution_short": { uz: "Ruxsat (Resolution)", ru: "Разрешение", en: "Resolution", type: "text" }, // For Monitors/General
    "os": { uz: "Operatsion tizim", ru: "Операционная система", en: "Operating System", type: "text" },

    "battery": { uz: "Batareya sig‘imi", ru: "Ёмкость батареи", en: "Battery Capacity", type: "text" },
    "weight": { uz: "Vazn", ru: "Вес", en: "Weight", type: "text" },

    "gpu": { uz: "Video karta (GPU)", ru: "Видеокарта (GPU)", en: "Graphics Card (GPU)", type: "text" },
    "refresh_rate": { uz: "Ekran yangilanish tezligi (Hz)", ru: "Частота обновления (Гц)", en: "Refresh Rate (Hz)", type: "text" },
    "refresh_rate_short": { uz: "Yangilanish tezligi (Hz)", ru: "Частота обновления", en: "Refresh Rate", type: "text" },
    "cooling_type": { uz: "Sovutish turi", ru: "Тип охлаждения", en: "Cooling Type", type: "text" },

    "security": { uz: "Xavfsizlik (Fingerprint / TPM)", ru: "Безопасность (Fingerprint / TPM)", en: "Security (Fingerprint / TPM)", type: "text" },
    "case_material": { uz: "Korpus materiali", ru: "Материал корпуса", en: "Case Material", type: "text" },
    "thickness": { uz: "Qalinlik", ru: "Толщина", en: "Thickness", type: "text" },
    "screen_type": { uz: "Ekran turi", ru: "Тип экрана", en: "Screen Type", type: "text" },
    "touchscreen": { uz: "Sensorli ekran", ru: "Сенсорный экран", en: "Touchscreen", type: "boolean" },
    "rotation_angle": { uz: "Aylanish burchagi", ru: "Угол поворота", en: "Rotation Angle", type: "text" },
    "stylus_support": { uz: "Stylus qo‘llab-quvvatlash", ru: "Поддержка стилуса", en: "Stylus Support", type: "boolean" },

    // MONITORS
    "response_time": { uz: "Javob vaqti (ms)", ru: "Время отклика (мс)", en: "Response Time (ms)", type: "text" },
    "panel_type": { uz: "Panel turi", ru: "Тип матрицы", en: "Panel Type", type: "text" },
    "adaptive_sync": { uz: "Adaptive Sync (G-Sync / FreeSync)", ru: "Adaptive Sync", en: "Adaptive Sync", type: "text" },
    "color_gamut": { uz: "Rang qamrovi (sRGB / AdobeRGB)", ru: "Цветовой охват", en: "Color Gamut", type: "text" },
    "calibration": { uz: "Kalibrlash", ru: "Калибровка", en: "Calibration", type: "boolean" },
    "diagonal": { uz: "Diagonal", ru: "Диагональ", en: "Diagonal", type: "text" },
    "ports": { uz: "Portlar", ru: "Порты", en: "Ports", type: "text" },
    "aspect_ratio": { uz: "Aspect ratio", ru: "Соотношение сторон", en: "Aspect Ratio", type: "text" },
    "power_type_usb": { uz: "Quvvatlanish turi (USB-C)", ru: "Тип питания (USB-C)", en: "Power Type (USB-C)", type: "text" },
    "compatibility": { uz: "Mos qurilmalar", ru: "Совместимые устройства", en: "Compatible Devices", type: "text" },

    // COMPONENTS - CPU
    "socket": { uz: "Soket", ru: "Сокет", en: "Socket", type: "text" },
    "core_count": { uz: "Yadro soni", ru: "Количество ядер", en: "Core Count", type: "number" },
    "thread_count": { uz: "Oqimlar (Threads)", ru: "Количество потоков", en: "Thread Count", type: "number" },
    "frequency": { uz: "Chastota", ru: "Частота", en: "Frequency", type: "text" },
    "cache": { uz: "Kesh", ru: "Кэш", en: "Cache", type: "text" },
    "tdp": { uz: "TDP", ru: "TDP", en: "TDP", type: "text" },

    // COMPONENTS - GPU
    "vram": { uz: "Video xotira (VRAM)", ru: "Видеопамять (VRAM)", en: "Video Memory (VRAM)", type: "text" },
    "memory_type": { uz: "Xotira turi", ru: "Тип памяти", en: "Memory Type", type: "text" },
    "interface": { uz: "Interfeys", ru: "Интерфейс", en: "Interface", type: "text" },
    "power_req": { uz: "Quvvat talabi", ru: "Требования к питанию", en: "Power Requirement", type: "text" },
    "max_res_gpu": { uz: "Maks. ruxsat", ru: "Макс. разрешение", en: "Max Resolution", type: "text" },

    // COMPONENTS - MB
    "chipset": { uz: "Chipset", ru: "Чипсет", en: "Chipset", type: "text" },
    "form_factor": { uz: "Form-factor", ru: "Форм-фактор", en: "Form Factor", type: "text" },
    "ram_type": { uz: "RAM turi", ru: "Тип RAM", en: "RAM Type", type: "text" },
    "slots": { uz: "Slotlar", ru: "Слоты", en: "Slots", type: "text" },

    // COMPONENTS - RAM
    "capacity": { uz: "Hajmi", ru: "Объем", en: "Capacity", type: "text" },
    "modules_count": { uz: "Modul soni", ru: "Количество модулей", en: "Module Count", type: "number" },
    "voltage": { uz: "Kuchlanish", ru: "Напряжение", en: "Voltage", type: "text" },
    "ecc": { uz: "ECC", ru: "ECC", en: "ECC", type: "boolean" },

    // COMPONENTS - DRIVE
    "drive_type": { uz: "Turi", ru: "Тип", en: "Type", type: "text" },
    "read_speed": { uz: "O‘qish tezligi", ru: "Скорость чтения", en: "Read Speed", type: "text" },
    "write_speed": { uz: "Yozish tezligi", ru: "Скорость записи", en: "Write Speed", type: "text" },

    // COMPONENTS - PSU
    "power_watt": { uz: "Quvvat (W)", ru: "Мощность (Вт)", en: "Power (W)", type: "number" },
    "certificate": { uz: "Sertifikat", ru: "Сертификат", en: "Certificate", type: "text" },
    "cable_type": { uz: "Kabel turi", ru: "Тип кабелей", en: "Cable Type", type: "text" },
    "protection_types": { uz: "Himoya turlari", ru: "Типы защиты", en: "Protection Types", type: "text" },

    // COMPONENTS - COOLING
    "supported_sockets": { uz: "Mos soketlar", ru: "Поддерживаемые сокеты", en: "Supported Sockets", type: "text" },
    "noise_level": { uz: "Shovqin darajasi", ru: "Уровень шума", en: "Noise Level", type: "text" },
    "fan_count": { uz: "Ventilyator soni", ru: "Количество вентиляторов", en: "Fan Count", type: "number" },
    "size": { uz: "O‘lchami", ru: "Размеры", en: "Size", type: "text" },
    "rgb": { uz: "RGB", ru: "RGB", en: "RGB", type: "boolean" },

    // COMPONENTS - CASE
    "material": { uz: "Material", ru: "Материал", en: "Material", type: "text" },
    "fan_slots": { uz: "Ventilyator joylari", ru: "Места для вентиляторов", en: "Fan Slots", type: "text" },
    "max_gpu_len": { uz: "Maks GPU uzunligi", ru: "Макс. длина GPU", en: "Max GPU Length", type: "text" },
    "usb_ports": { uz: "USB portlar", ru: "USB порты", en: "USB Ports", type: "text" },

    // PERIPHERALS - KEYBOARD
    "keyboard_type": { uz: "Turi (Mechanical/Membrane)", ru: "Тип клавиатуры", en: "Keyboard Type", type: "text" },
    "switch_type": { uz: "Switch turi", ru: "Тип переключателей", en: "Switch Type", type: "text" },
    "backlight": { uz: "Yoritish", ru: "Подсветка", en: "Backlight", type: "text" },
    "connection": { uz: "Ulanish", ru: "Подключение", en: "Connection", type: "text" },
    "layout": { uz: "Til", ru: "Язык", en: "Language", type: "text" },
    "kb_size": { uz: "O‘lcham", ru: "Размер", en: "Size", type: "text" },

    // PERIPHERALS - MOUSE
    "dpi": { uz: "DPI", ru: "DPI", en: "DPI", type: "number" },
    "sensor_type": { uz: "Sensor turi", ru: "Тип сенсора", en: "Sensor Type", type: "text" },
    "buttons_count": { uz: "Tugmalar soni", ru: "Количество кнопок", en: "Buttons Count", type: "number" },
    "ergonomics": { uz: "Ergonomika", ru: "Эргономика", en: "Ergonomics", type: "text" },

    // PERIPHERALS - HEADSET
    "headset_type": { uz: "Turi", ru: "Тип", en: "Type", type: "text" },
    "microphone": { uz: "Mikrofon", ru: "Микрофон", en: "Microphone", type: "boolean" },
    "noise_reduction": { uz: "Shovqin pasaytirish", ru: "Шумоподавление", en: "Noise Reduction", type: "boolean" },

    // PERIPHERALS - WEBCAM
    "fps": { uz: "FPS", ru: "FPS", en: "FPS", type: "number" },
    "focus": { uz: "Fokus", ru: "Фокус", en: "Focus", type: "text" },
    "webcam_res": { uz: "Ruxsat", ru: "Разрешение", en: "Resolution", type: "text" },

    // PERIPHERALS - MIC
    "mic_type": { uz: "Turi", ru: "Тип", en: "Type", type: "text" },
    "directivity": { uz: "Yo‘naltirilganlik", ru: "Направленность", en: "Directivity", type: "text" },
    "sensitivity": { uz: "Ovoz sezgirligi", ru: "Чувствительность", en: "Sensitivity", type: "text" },

    // PERIPHERALS - GAMEPAD
    "platform": { uz: "Platforma", ru: "Платформа", en: "Platform", type: "text" },
    "buttons_gamepad": { uz: "Tugmalar", ru: "Кнопки", en: "Buttons", type: "text" },
    "vibration": { uz: "Vibratsiya", ru: "Вибрация", en: "Vibration", type: "boolean" },
    "accumulator": { uz: "Akkumulyator", ru: "Аккумулятор", en: "Battery", type: "boolean" },

    // OFFICE - PRINTER
    "print_type": { uz: "Chop etish turi", ru: "Тип печати", en: "Print Type", type: "text" },
    "color_mode": { uz: "Rangli/oq-qora", ru: "Цветность", en: "Color Mode", type: "text" },
    "format": { uz: "Format", ru: "Формат", en: "Format", type: "text" },
    "speed": { uz: "Tezlik", ru: "Скорость", en: "Speed", type: "text" },
    "wifi": { uz: "Wi-Fi", ru: "Wi-Fi", en: "Wi-Fi", type: "boolean" },
    "duplex": { uz: "Duplex", ru: "Двусторонняя печать", en: "Duplex", type: "boolean" },

    // OFFICE - SCANNER
    "scan_res": { uz: "Ruxsat", ru: "Разрешение", en: "Resolution", type: "text" },
    "scan_sensor": { uz: "Sensor", ru: "Сенсор", en: "Sensor", type: "text" },
    "ocr": { uz: "OCR", ru: "OCR", en: "OCR", type: "boolean" },

    // OFFICE - UPS
    "battery_type": { uz: "Batareya turi", ru: "Тип батареи", en: "Battery Type", type: "text" },
    "backup_time": { uz: "Zaxira vaqti", ru: "Время резерва", en: "Backup Time", type: "text" },
    "sockets": { uz: "Rozetkalar", ru: "Розетки", en: "Sockets", type: "text" },
    "protection": { uz: "Himoya", ru: "Защита", en: "Protection", type: "text" },
    "display": { uz: "Display", ru: "Дисплей", en: "Display", type: "boolean" },

    // OFFICE - LAMINATOR
    "lam_thickness": { uz: "Qalinlik", ru: "Толщина", en: "Thickness", type: "text" },
    "work_time": { uz: "Ishlash vaqti", ru: "Время работы", en: "Work Time", type: "text" },
    "noise": { uz: "Shovqin", ru: "Шум", en: "Noise", type: "text" },

    // NETWORK
    "standard": { uz: "Standart", ru: "Стандарт", en: "Standard", type: "text" },
    "antenna": { uz: "Antenna", ru: "Антенна", en: "Antenna", type: "text" },
    "support": { uz: "Qo‘llab-quvvatlash", ru: "Поддержка", en: "Support", type: "text" },

    // STORAGE
    "shock_protect": { uz: "Zarba himoyasi", ru: "Ударопрочность", en: "Shock Protection", type: "boolean" },
    "disk_count": { uz: "Disk soni", ru: "Количество дисков", en: "Disk Count", type: "number" },
    "raid": { uz: "RAID", ru: "RAID", en: "RAID", type: "text" },

    // ACCESSORIES
    "volume": { uz: "Hajm", ru: "Объем", en: "Volume", type: "text" },
    "color": { uz: "Rang", ru: "Цвет", en: "Color", type: "text" },
    "extra": { uz: "Qo‘shimcha funksiyalar", ru: "Доп. функции", en: "Extra Features", type: "text" },

    // SOFTWARE
    "sw_type": { uz: "Turi", ru: "Тип", en: "Type", type: "text" },
    "version": { uz: "Versiya", ru: "Версия", en: "Version", type: "text" },
    "license_type": { uz: "Litsenziya turi", ru: "Тип лицензии", en: "License Type", type: "text" },
    "activation": { uz: "Faollashtirish", ru: "Активация", en: "Activation", type: "text" },
    "validity": { uz: "Amal qilish muddati", ru: "Срок действия", en: "Validity", type: "text" },
    "sw_platform": { uz: "Platforma", ru: "Платформа", en: "Platform", type: "text" }
};

// 2. STRICT MAPPING (Slug Keyword -> Keys List)
const MAPPINGS: Record<string, string[]> = {
    // 1. KOMPYUTERLAR
    "monoblok": ["cpu", "ram", "storage_type", "screen_size", "resolution", "os"],

    // 2. NOUTBUKLAR
    "office": ["cpu", "ram", "storage", "screen_size", "battery", "weight"],
    "gaming": ["cpu", "gpu", "ram", "storage", "refresh_rate", "cooling_type"],
    "biznes": ["cpu", "ram", "storage", "security", "battery", "case_material"],
    "ultrabook": ["cpu", "ram", "ssd_capacity", "weight", "thickness", "screen_type"],
    "transformer": ["cpu", "ram", "storage", "touchscreen", "rotation_angle", "stylus_support"],

    // 3. MONITORLAR
    "gaming-monitor": ["screen_size", "resolution_short", "refresh_rate_short", "response_time", "panel_type", "adaptive_sync"],
    "professional": ["color_gamut", "resolution_short", "panel_type", "calibration", "diagonal", "ports"],
    "ultrawide": ["diagonal", "aspect_ratio", "resolution_short", "panel_type", "refresh_rate_short", "ports"],
    "portable": ["diagonal", "resolution_short", "power_type_usb", "weight", "thickness", "compatibility"],

    // 4. KOMPONENTLAR
    "protsessor": ["socket", "core_count", "thread_count", "frequency", "cache", "tdp"],
    "video": ["vram", "memory_type", "interface", "power_req", "cooling_type", "max_res_gpu"],
    "plata": ["socket", "chipset", "form_factor", "ram_type", "slots", "ports"],
    "operativ": ["capacity", "ram_type", "frequency", "modules_count", "voltage", "ecc"],
    "ssd": ["capacity", "drive_type", "interface", "read_speed", "write_speed", "form_factor"],
    "quvvat": ["power_watt", "certificate", "form_factor", "cable_type", "protection_types", "cooling_type"],
    "sovutish": ["cooling_type", "supported_sockets", "noise_level", "fan_count", "size", "rgb"],
    "korpus": ["form_factor", "material", "fan_slots", "max_gpu_len", "usb_ports", "rgb"],

    // 5. PERIFERIYA
    "klaviatura": ["keyboard_type", "switch_type", "backlight", "connection", "layout", "kb_size"],
    "sichqoncha": ["dpi", "sensor_type", "buttons_count", "connection", "weight", "ergonomics"],
    "quloqchin": ["headset_type", "microphone", "connection", "noise_reduction", "frequency", "weight"],
    "veb-kamera": ["webcam_res", "fps", "microphone", "focus", "connection", "compatibility"],
    "mikrofon": ["mic_type", "directivity", "frequency", "connection", "sensitivity", "compatibility"],
    "gamepad": ["platform", "connection", "buttons_gamepad", "vibration", "accumulator", "ergonomics"],

    // 6. OFIS TEXNIKASI
    "printer": ["print_type", "color_mode", "format", "speed", "wifi", "duplex"],
    "skaner": ["scan_res", "format", "speed", "scan_sensor", "connection", "ocr"],
    "ups": ["power_watt", "battery_type", "backup_time", "sockets", "protection", "display"],
    "laminator": ["format", "speed", "lam_thickness", "work_time", "security", "noise"],

    // 7. TARMOQ
    "router": ["standard", "ports", "speed", "antenna", "security", "support"],

    // 8. SAQLASH
    "tashqi": ["capacity", "interface", "speed", "shock_protect", "compatibility", "weight"],
    "nas": ["disk_count", "raid", "cpu", "ram", "ports", "os"], // 'ports' reused from general

    // 9. AKSESSUARLAR
    "sumka": ["compatibility", "material", "volume", "color", "weight", "extra"],

    // 10. DASTURIY
    "dastur": ["sw_type", "version", "license_type", "activation", "validity", "sw_platform"]
};

// Map of slug segments to ensure we find the right categories
// Simple keyword matching will be used: if category slug/name contains the key.
async function main() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('1. Seeding Global Characteristics (Strict v2.1)...');

        for (const key in CHARACTERISTICS) {
            const char = CHARACTERISTICS[key];
            await client.query(`
                INSERT INTO characteristics (key, name_uz, name_ru, name_en, type, is_active)
                VALUES ($1, $2, $3, $4, $5, true)
                ON CONFLICT (key) DO UPDATE SET
                    name_uz = EXCLUDED.name_uz,
                    name_ru = EXCLUDED.name_ru,
                    name_en = EXCLUDED.name_en,
                    type = EXCLUDED.type
            `, [key, char.uz, char.ru, char.en, char.type || 'text']);
        }
        console.log('Characteristics ensured.');

        console.log('2. Syncing Characteristics to Subcategories...');

        const charRes = await client.query('SELECT id, key FROM characteristics');
        const charMap = new Map<string, number>();
        charRes.rows.forEach((r: any) => charMap.set(r.key, r.id));

        // Get all categories to match against
        const catsRes = await client.query('SELECT id, slug, name_ru, name_uz, name_en FROM categories');
        const allCats = catsRes.rows;

        for (const keyword in MAPPINGS) {
            const requiredChars = MAPPINGS[keyword];

            // Filter targets
            const targets = allCats.filter(c => {
                const s = (c.slug || '').toLowerCase();
                const nRu = (c.name_ru || '').toLowerCase();
                const nUz = (c.name_uz || '').toLowerCase();
                const k = keyword.toLowerCase();
                // Avoid matching parent 'notebooks' when looking for 'gaming-notebooks' if searching 'gaming'
                return s.includes(k) || nRu.includes(k) || nUz.includes(k);
            });

            if (targets.length === 0) {
                console.warn(`No categories found matching keyword: "${keyword}"`);
                continue;
            }

            for (const cat of targets) {
                console.log(`Syncing "${keyword}" -> Category ID ${cat.id} (${cat.slug})`);

                // Strict Sync: Delete all existing, insert new 6
                await client.query('DELETE FROM category_characteristics WHERE category_id = $1', [cat.id]);

                let order = 0;
                for (const charKey of requiredChars) {
                    const charId = charMap.get(charKey);
                    if (!charId) {
                        console.warn(`  - Characteristic key not found: ${charKey}`);
                        continue;
                    }

                    await client.query(`
                        INSERT INTO category_characteristics (category_id, characteristic_id, is_required, show_in_key_specs, order_index)
                        VALUES ($1, $2, true, true, $3)
                        ON CONFLICT (category_id, characteristic_id) DO NOTHING
                    `, [cat.id, charId, order++]);
                }
            }
        }

        await client.query('COMMIT');
        console.log('Seeding v2.1 completed successfully.');

    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Seeding failed:', e);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
