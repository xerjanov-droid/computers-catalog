import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Tarjimalar lug'ati
const translations: { [key: string]: { ru: string; uz: string } } = {
    'CPU': { ru: 'Процессор', uz: 'Protsessor' },
    'RAM': { ru: 'Оперативная память', uz: 'Operativ xotira' },
    'Storage': { ru: 'Накопитель', uz: 'Xotira' },
    'GPU': { ru: 'Видеокарта', uz: 'Video karta' },
    'OS': { ru: 'Операционная система', uz: 'Operatsion tizim' },
    'Case Type': { ru: 'Тип корпуса', uz: 'Korpus turi' },
    'Screen Size': { ru: 'Размер экрана', uz: 'Ekran o\'lchami' },
    'Resolution': { ru: 'Разрешение', uz: 'Ruxsat etilgan' },
    'Refresh Rate': { ru: 'Частота обновления', uz: 'Yangilanish chastotasi' },
    'Weight': { ru: 'Вес', uz: 'Og\'irlik' },
    'Ports': { ru: 'Порты', uz: 'Portlar' },
    'Connectivity': { ru: 'Подключение', uz: 'Ulanish' },
    'Activation': { ru: 'Активация', uz: 'Faollashtirish' },
    'Validity': { ru: 'Срок действия', uz: 'Amal qilish muddati' },
    'Security': { ru: 'Безопасность', uz: 'Xavfsizlik' },
    'Screen Type': { ru: 'Тип экрана', uz: 'Ekran turi' },
    'Touchscreen': { ru: 'Сенсорный экран', uz: 'Sensorli ekran' },
    'Response Time': { ru: 'Время отклика', uz: 'Javob vaqti' },
    'Panel Type': { ru: 'Тип панели', uz: 'Panel turi' },
    'Adaptive Sync': { ru: 'Адаптивная синхронизация', uz: 'Adaptiv sinxronizatsiya' },
    'Color Gamut': { ru: 'Цветовой охват', uz: 'Rang qamrovi' },
    'Aspect Ratio': { ru: 'Соотношение сторон', uz: 'Tomosha nisbati' },
    'Platform': { ru: 'Платформа', uz: 'Platforma' },
    'Language': { ru: 'Язык', uz: 'Til' },
    'Users Count': { ru: 'Количество пользователей', uz: 'Foydalanuvchilar soni' },
    'Cooling Type': { ru: 'Тип охлаждения', uz: 'Sovutish turi' },
    'Stylus Support': { ru: 'Поддержка стилуса', uz: 'Stylus qo\'llab-quvvatlash' },
    'Diagonal': { ru: 'Диагональ', uz: 'Diagonal' },
    'Socket': { ru: 'Сокет', uz: 'Socket' },
    'Core Count': { ru: 'Количество ядер', uz: 'Yadrolar soni' },
    'Thread Count': { ru: 'Количество потоков', uz: 'Oqimlar soni' },
    'Frequency': { ru: 'Частота', uz: 'Chastota' },
    'TDP': { ru: 'TDP', uz: 'TDP' },
    'Chipset': { ru: 'Чипсет', uz: 'Chipset' },
    'Form Factor': { ru: 'Форм-фактор', uz: 'Forma faktori' },
    'Capacity': { ru: 'Емкость', uz: 'Sig\'im' },
    'Voltage': { ru: 'Напряжение', uz: 'Kuchlanish' },
    'ECC': { ru: 'ECC', uz: 'ECC' },
    'Read Speed': { ru: 'Скорость чтения', uz: 'O\'qish tezligi' },
    'Write Speed': { ru: 'Скорость записи', uz: 'Yozish tezligi' },
    'Power (Watt)': { ru: 'Мощность (Вт)', uz: 'Quvvat (Vt)' },
    'Noise Level': { ru: 'Уровень шума', uz: 'Shovqin darajasi' },
    'Fan Count': { ru: 'Количество вентиляторов', uz: 'Ventilyatorlar soni' },
    'RGB': { ru: 'RGB', uz: 'RGB' },
    'USB Ports': { ru: 'USB порты', uz: 'USB portlar' },
    'Switch Type': { ru: 'Тип переключателя', uz: 'Kalit turi' },
    'Backlight': { ru: 'Подсветка', uz: 'Yoritish' },
    'Connection': { ru: 'Подключение', uz: 'Ulanish' },
    'DPI': { ru: 'DPI', uz: 'DPI' },
    'Sensor Type': { ru: 'Тип сенсора', uz: 'Sensor turi' },
    'Buttons Count': { ru: 'Количество кнопок', uz: 'Tugmalar soni' },
    'Microphone': { ru: 'Микрофон', uz: 'Mikrofon' },
    'Noise Cancellation': { ru: 'Шумоподавление', uz: 'Shovqinni kamaytirish' },
    'FPS': { ru: 'FPS', uz: 'FPS' },
    'Vibration': { ru: 'Вибрация', uz: 'Titrash' },
    'Print Type': { ru: 'Тип печати', uz: 'Bosib chiqarish turi' },
    'Format': { ru: 'Формат', uz: 'Format' },
    'Speed': { ru: 'Скорость', uz: 'Tezlik' },
    'Wi-Fi': { ru: 'Wi-Fi', uz: 'Wi-Fi' },
    'Duplex': { ru: 'Двусторонняя печать', uz: 'Ikki tomonlama bosib chiqarish' },
    'Sensor': { ru: 'Сенсор', uz: 'Sensor' },
    'OCR': { ru: 'OCR', uz: 'OCR' },
    'Backup Time': { ru: 'Время резервного питания', uz: 'Zaxira quvvat vaqti' },
    'Battery Type': { ru: 'Тип батареи', uz: 'Batareya turi' },
    'Protection': { ru: 'Защита', uz: 'Himoya' },
    'Display': { ru: 'Дисплей', uz: 'Displey' },
    'Standard': { ru: 'Стандарт', uz: 'Standart' },
    'Antenna': { ru: 'Антенна', uz: 'Antenna' },
    'RAID Support': { ru: 'Поддержка RAID', uz: 'RAID qo\'llab-quvvatlash' },
    'Color': { ru: 'Цвет', uz: 'Rang' },
    'Storage (SSD/HDD)': { ru: 'Накопитель (SSD/HDD)', uz: 'Xotira (SSD/HDD)' },
    'Integrated Graphics': { ru: 'Встроенная графика', uz: 'O\'rnatilgan grafika' },
    'Operating System': { ru: 'Операционная система', uz: 'Operatsion tizim' },
    'Power Supply': { ru: 'Блок питания', uz: 'Quvvat manbai' },
    'Cooling System': { ru: 'Система охлаждения', uz: 'Sovutish tizimi' },
    'Certification (ISV)': { ru: 'Сертификация (ISV)', uz: 'Sertifikatlash (ISV)' },
    'Graphics Type': { ru: 'Тип графики', uz: 'Grafika turi' },
    'Mount Support (VESA)': { ru: 'Поддержка крепления (VESA)', uz: 'Mahkamlash qo\'llab-quvvatlash (VESA)' },
    'Battery Capacity': { ru: 'Емкость батареи', uz: 'Batareya sig\'imi' },
    'Screen Refresh Rate': { ru: 'Частота обновления экрана', uz: 'Ekran yangilanish chastotasi' },
    'Security Features': { ru: 'Функции безопасности', uz: 'Xavfsizlik funksiyalari' },
    'Battery Life': { ru: 'Время работы от батареи', uz: 'Batareyadan ishlash vaqti' },
    'Adjustable Stand': { ru: 'Регулируемая подставка', uz: 'Sozlanishi mumkin bo\'lgan taglik' },
    'Sync Technology': { ru: 'Технология синхронизации', uz: 'Sinxronizatsiya texnologiyasi' },
    'Factory Calibration': { ru: 'Заводская калибровка', uz: 'Zavod kalibratsiyasi' },
    'Power Source': { ru: 'Источник питания', uz: 'Quvvat manbai' },
    'Stand Type': { ru: 'Тип подставки', uz: 'Taglik turi' },
    'Base Frequency': { ru: 'Базовая частота', uz: 'Asosiy chastota' },
    'Turbo Frequency': { ru: 'Турбо частота', uz: 'Turbo chastota' },
    'VRAM Size': { ru: 'Объем видеопамяти', uz: 'Video xotira hajmi' },
    'Memory Type': { ru: 'Тип памяти', uz: 'Xotira turi' },
    'Outputs': { ru: 'Выходы', uz: 'Chiqishlar' },
    'Power Consumption': { ru: 'Потребление энергии', uz: 'Energiya iste\'moli' },
    'RAM Slots': { ru: 'Слоты оперативной памяти', uz: 'Operativ xotira slotlari' },
    'Storage Interfaces': { ru: 'Интерфейсы накопителя', uz: 'Xotira interfeyslari' },
    'Expansion Slots': { ru: 'Слоты расширения', uz: 'Kengaytirish slotlari' },
    'Type': { ru: 'Тип', uz: 'Turi' },
    'Kit Type': { ru: 'Тип комплекта', uz: 'Komplekt turi' },
    'Type (SSD/HDD)': { ru: 'Тип (SSD/HDD)', uz: 'Turi (SSD/HDD)' },
    'Efficiency Rating': { ru: 'КПД', uz: 'Samaradorlik' },
    'Modular Type': { ru: 'Тип модульности', uz: 'Modullik turi' },
    'Protection Features': { ru: 'Функции защиты', uz: 'Himoya funksiyalari' },
    'Cooling Fan Size': { ru: 'Размер вентилятора охлаждения', uz: 'Sovutish ventilyatori o\'lchami' },
    'Type (Air/Liquid)': { ru: 'Тип (Воздушное/Жидкостное)', uz: 'Turi (Havo/Suyuq)' },
    'Socket Support': { ru: 'Поддержка сокетов', uz: 'Socket qo\'llab-quvvatlash' },
    'Fan Size': { ru: 'Размер вентилятора', uz: 'Ventilyator o\'lchami' },
    'TDP Support': { ru: 'Поддержка TDP', uz: 'TDP qo\'llab-quvvatlash' },
    'RGB Support': { ru: 'Поддержка RGB', uz: 'RGB qo\'llab-quvvatlash' },
    'Material': { ru: 'Материал', uz: 'Material' },
    'Cooling Support': { ru: 'Поддержка охлаждения', uz: 'Sovutish qo\'llab-quvvatlash' },
    'Drive Bays': { ru: 'Отсеки для накопителей', uz: 'Xotira uchun bo\'limlar' },
    'Front Ports': { ru: 'Передние порты', uz: 'Old portlar' },
    'Layout': { ru: 'Раскладка', uz: 'Tartib' },
    'Wrist Rest': { ru: 'Подставка для запястий', uz: 'Bilak tagligi' },
    'Frequency Range': { ru: 'Частотный диапазон', uz: 'Chastota diapazoni' },
    'Frame Rate': { ru: 'Частота кадров', uz: 'Kadr chastotasi' },
    'Autofocus': { ru: 'Автофокус', uz: 'Avtofokus' },
    'Mount Type': { ru: 'Тип крепления', uz: 'Mahkamlash turi' },
    'Polar Pattern': { ru: 'Полярная диаграмма', uz: 'Polar diagramma' },
    'Stand Included': { ru: 'Подставка в комплекте', uz: 'Taglik komplektda' },
    'Use Case': { ru: 'Область применения', uz: 'Qo\'llash sohasi' },
    'Platform Support': { ru: 'Поддержка платформ', uz: 'Platformalar qo\'llab-quvvatlash' },
    'Print Speed': { ru: 'Скорость печати', uz: 'Bosib chiqarish tezligi' },
    'Duplex Support': { ru: 'Поддержка двусторонней печати', uz: 'Ikki tomonlama bosib chiqarish qo\'llab-quvvatlash' },
    'Paper Size': { ru: 'Размер бумаги', uz: 'Qog\'oz o\'lchami' },
    'Functions': { ru: 'Функции', uz: 'Funksiyalar' },
    'Scan Resolution': { ru: 'Разрешение сканирования', uz: 'Skanerlash ruxsati' },
    'ADF Support': { ru: 'Поддержка ADF', uz: 'ADF qo\'llab-quvvatlash' },
    'Scan Type': { ru: 'Тип сканирования', uz: 'Skanerlash turi' },
    'Scan Speed': { ru: 'Скорость сканирования', uz: 'Skanerlash tezligi' },
    'ADF': { ru: 'ADF', uz: 'ADF' },
    'Max Paper Size': { ru: 'Максимальный размер бумаги', uz: 'Maksimal qog\'oz o\'lchami' },
    'Capacity (VA)': { ru: 'Мощность (ВА)', uz: 'Quvvat (VA)' },
    'Output Power': { ru: 'Выходная мощность', uz: 'Chiqish quvvati' },
    'Outlets': { ru: 'Розетки', uz: 'Rozetkalar' },
    'Warm-up Time': { ru: 'Время прогрева', uz: 'Ishlash vaqti' },
    'Lamination Thickness': { ru: 'Толщина ламинации', uz: 'Laminatsiya qalinligi' },
    'Temperature Control': { ru: 'Контроль температуры', uz: 'Harorat nazorati' },
    'Use Type': { ru: 'Тип использования', uz: 'Ishlatish turi' },
    'Cut Type': { ru: 'Тип резки', uz: 'Kesish turi' },
    'Sheet Capacity': { ru: 'Емкость листов', uz: 'Varaqlar sig\'imi' },
    'Security Level': { ru: 'Уровень безопасности', uz: 'Xavfsizlik darajasi' },
    'Bin Capacity': { ru: 'Емкость контейнера', uz: 'Konteyner sig\'imi' },
    'Continuous Run Time': { ru: 'Время непрерывной работы', uz: 'Uzluksiz ishlash vaqti' },
    'Wi-Fi Standard': { ru: 'Стандарт Wi-Fi', uz: 'Wi-Fi standarti' },
    'Bands': { ru: 'Диапазоны', uz: 'Diapazonlar' },
    'Antennas': { ru: 'Антенны', uz: 'Antennalar' },
    'Ports Count': { ru: 'Количество портов', uz: 'Portlar soni' },
    'Managed Type': { ru: 'Тип управления', uz: 'Boshqaruv turi' },
    'Rack Mountable': { ru: 'Монтаж в стойку', uz: 'Stoykaga o\'rnatish' },
    'PoE Support': { ru: 'Поддержка PoE', uz: 'PoE qo\'llab-quvvatlash' },
    'Coverage Area': { ru: 'Зона покрытия', uz: 'Qamrov zonasi' },
    'Power Method': { ru: 'Способ питания', uz: 'Quvvatlash usuli' },
    'Max Clients': { ru: 'Максимальное количество клиентов', uz: 'Maksimal mijozlar soni' },
    'Connection Type': { ru: 'Тип подключения', uz: 'Ulanish turi' },
    'ISP Compatibility': { ru: 'Совместимость с провайдером', uz: 'Provayder bilan mos keluvchanlik' },
    'Wi-Fi Support': { ru: 'Поддержка Wi-Fi', uz: 'Wi-Fi qo\'llab-quvvatlash' },
    'OS Support': { ru: 'Поддержка ОС', uz: 'OS qo\'llab-quvvatlash' },
    'Shock Resistance': { ru: 'Ударопрочность', uz: 'Zarbaga chidamlilik' },
    'Bays Count': { ru: 'Количество отсеков', uz: 'Bo\'limlar soni' },
    'Network Speed': { ru: 'Скорость сети', uz: 'Tarmoq tezligi' },
    'Supported Cards': { ru: 'Поддерживаемые карты', uz: 'Qo\'llab-quvvatlanadigan kartalar' },
    'Slots Count': { ru: 'Количество слотов', uz: 'Slotlar soni' },
    'Size Compatibility': { ru: 'Совместимость размеров', uz: 'O\'lchamlar mos keluvchanligi' },
    'Compartments': { ru: 'Отделения', uz: 'Bo\'limlar' },
    'Waterproof': { ru: 'Водонепроницаемость', uz: 'Suv o\'tkazmaslik' },
    'Size Support': { ru: 'Поддержка размеров', uz: 'O\'lchamlar qo\'llab-quvvatlash' },
    'Adjustable Height': { ru: 'Регулируемая высота', uz: 'Sozlanishi mumkin bo\'lgan balandlik' },
    'Length': { ru: 'Длина', uz: 'Uzunlik' },
    'Connector': { ru: 'Разъем', uz: 'Ulanish' },
    'Data Speed': { ru: 'Скорость передачи данных', uz: 'Ma\'lumot uzatish tezligi' },
    'Shielding': { ru: 'Экранирование', uz: 'Ekranlash' },
    'Power Output': { ru: 'Выходная мощность', uz: 'Chiqish quvvati' },
    'Connector Type': { ru: 'Тип разъема', uz: 'Ulanish turi' },
    'Fast Charge': { ru: 'Быстрая зарядка', uz: 'Tez zaryadlash' },
    'Cable Included': { ru: 'Кабель в комплекте', uz: 'Kabel komplektda' },
    'Life Cycle': { ru: 'Жизненный цикл', uz: 'Hayotiy tsikl' },
    'Dimensions': { ru: 'Габариты', uz: 'O\'lchamlar' },
    'Architecture': { ru: 'Архитектура', uz: 'Arxitektura' },
    'Language Support': { ru: 'Поддержка языков', uz: 'Tillarni qo\'llab-quvvatlash' },
    'Activation Type': { ru: 'Тип активации', uz: 'Faollashtirish turi' },
    'Included Apps': { ru: 'Включенные приложения', uz: 'Kiritilgan ilovalar' },
    'Subscription': { ru: 'Подписка', uz: 'Obuna' },
    'License Duration': { ru: 'Срок действия лицензии', uz: 'Litsenziya muddati' },
    'Protection Type': { ru: 'Тип защиты', uz: 'Himoya turi' },
    'Updates': { ru: 'Обновления', uz: 'Yangilanishlar' },
    'Firewall': { ru: 'Файрвол', uz: 'Firewall' },
    'Support': { ru: 'Поддержка', uz: 'Qo\'llab-quvvatlash' },
    'Product Type': { ru: 'Тип продукта', uz: 'Mahsulot turi' },
    'Delivery Method': { ru: 'Способ доставки', uz: 'Yetkazib berish usuli' },
    'License Type': { ru: 'Тип лицензии', uz: 'Litsenziya turi' },
    'Validity Period': { ru: 'Срок действия', uz: 'Amal qilish muddati' },
    'Devices Count': { ru: 'Количество устройств', uz: 'Qurilmalar soni' },
    'Activation Method': { ru: 'Способ активации', uz: 'Faollashtirish usuli' },
    'Support Period': { ru: 'Период поддержки', uz: 'Qo\'llab-quvvatlash muddati' },
    'Updates Included': { ru: 'Обновления включены', uz: 'Yangilanishlar kiritilgan' },
    'Max Speed': { ru: 'Максимальная скорость', uz: 'Maksimal tezlik' },
    'Frequency Bands': { ru: 'Частотные диапазоны', uz: 'Chastota diapazonlari' },
    'Interface': { ru: 'Интерфейс', uz: 'Interfeys' },
    'Antenna Type': { ru: 'Тип антенны', uz: 'Antenna turi' },
    'Compatibility': { ru: 'Совместимость', uz: 'Mos keluvchanlik' },
};

// Tarjima yaratish funksiyasi
function getTranslation(nameEn: string): { ru: string; uz: string } {
    // To'g'ridan-to'g'ri lug'atdan qidirish
    if (translations[nameEn]) {
        return translations[nameEn];
    }

    // Agar topilmasa, inglizcha nomni asosida tarjima yaratish
    // Bu oddiy yondashuv, lekin ko'p hollarda ishlaydi
    const commonTranslations: { [key: string]: { ru: string; uz: string } } = {
        'Type': { ru: 'Тип', uz: 'Turi' },
        'Count': { ru: 'Количество', uz: 'Soni' },
        'Size': { ru: 'Размер', uz: 'O\'lchami' },
        'Speed': { ru: 'Скорость', uz: 'Tezlik' },
        'Support': { ru: 'Поддержка', uz: 'Qo\'llab-quvvatlash' },
        'Level': { ru: 'Уровень', uz: 'Daraja' },
        'Time': { ru: 'Время', uz: 'Vaqt' },
        'Method': { ru: 'Способ', uz: 'Usul' },
        'Period': { ru: 'Период', uz: 'Muddati' },
    };

    // Oddiy tarjima yaratish (keyinchalik qo'lda tuzatish kerak)
    return {
        ru: nameEn, // Vaqtincha inglizcha qoldiramiz
        uz: nameEn  // Vaqtincha inglizcha qoldiramiz
    };
}

async function generateTranslations() {
    const client = await pool.connect();
    
    try {
        console.log('🔍 Muammoli xarakteristikalar topilmoqda...\n');

        // Muammoli xarakteristikalarni topish
        const result = await client.query(`
            SELECT 
                id,
                key,
                name_ru,
                name_uz,
                name_en,
                type
            FROM characteristics
            WHERE (name_ru = name_en OR name_uz = name_en OR name_ru = name_uz)
                AND name_ru IS NOT NULL
                AND name_uz IS NOT NULL
                AND name_en IS NOT NULL
            ORDER BY id ASC
        `);

        const problematicChars = result.rows;

        if (problematicChars.length === 0) {
            console.log('✅ Muammoli xarakteristikalar topilmadi.');
            return;
        }

        console.log(`📊 Topilgan muammoli xarakteristikalar: ${problematicChars.length}\n`);
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('💡 TAKLIF QILINAYOTGAN TARJIMALAR');
        console.log('═══════════════════════════════════════════════════════════════\n');

        const updates: Array<{ id: number; key: string; current: { ru: string; uz: string; en: string }; proposed: { ru: string; uz: string } }> = [];

        for (const char of problematicChars) {
            const nameEn = char.name_en || '';
            const translation = getTranslation(nameEn);
            
            // Agar hali ham bir xil bo'lsa, tarjima taklif qilish
            let needsRuUpdate = char.name_ru === char.name_en;
            let needsUzUpdate = char.name_uz === char.name_en;

            // Agar tarjima topilgan bo'lsa
            if (translations[nameEn]) {
                updates.push({
                    id: char.id,
                    key: char.key,
                    current: {
                        ru: char.name_ru,
                        uz: char.name_uz,
                        en: char.name_en
                    },
                    proposed: translation
                });
            }
        }

        // Takliflarni ko'rsatish
        for (const update of updates) {
            console.log(`\n📝 ID: ${update.id} | Key: ${update.key}`);
            console.log(`   Hozirgi:`);
            console.log(`     RU: ${update.current.ru}`);
            console.log(`     UZ: ${update.current.uz}`);
            console.log(`     EN: ${update.current.en}`);
            console.log(`   Taklif:`);
            console.log(`     RU: ${update.proposed.ru}`);
            console.log(`     UZ: ${update.proposed.uz}`);
        }

        // SQL script generatsiya
        console.log('\n\n═══════════════════════════════════════════════════════════════');
        console.log('📝 SQL UPDATE SCRIPT (Tasdiqlasangiz bajariladi)');
        console.log('═══════════════════════════════════════════════════════════════\n');

        console.log('-- Xarakteristikalar tarjimalarini yangilash\n');
        console.log('BEGIN;\n');

        for (const update of updates) {
            console.log(`-- ${update.key} (ID: ${update.id})`);
            console.log(`UPDATE characteristics`);
            console.log(`SET name_ru = '${update.proposed.ru.replace(/'/g, "''")}',`);
            console.log(`    name_uz = '${update.proposed.uz.replace(/'/g, "''")}'`);
            console.log(`WHERE id = ${update.id};`);
            console.log('');
        }

        console.log('COMMIT;\n');

        // TypeScript script generatsiya
        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('📝 TYPESCRIPT SCRIPT (Tasdiqlasangiz bajariladi)');
        console.log('═══════════════════════════════════════════════════════════════\n');

        console.log('// Bu scriptni bajarish uchun tasdiqlang va keyin ishga tushiring\n');
        console.log('const updates = [');
        for (const update of updates) {
            console.log(`    { id: ${update.id}, key: '${update.key}', name_ru: '${update.proposed.ru.replace(/'/g, "\\'")}', name_uz: '${update.proposed.uz.replace(/'/g, "\\'")}' },`);
        }
        console.log('];\n');
        console.log('for (const update of updates) {');
        console.log('    await client.query(');
        console.log('        `UPDATE characteristics SET name_ru = $1, name_uz = $2 WHERE id = $3`,');
        console.log('        [update.name_ru, update.name_uz, update.id]');
        console.log('    );');
        console.log('    console.log(`✅ ${update.key} yangilandi`);');
        console.log('}\n');

        console.log(`\n📊 Jami: ${updates.length} ta xarakteristika uchun tarjimalar taklif qilindi.`);

    } catch (e) {
        console.error('❌ Xatolik:', e);
        throw e;
    } finally {
        client.release();
        await pool.end();
    }
}

generateTranslations();

