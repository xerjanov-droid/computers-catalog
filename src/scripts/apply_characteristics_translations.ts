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

// Tarjimalar ro'yxati (generate_characteristics_translations.ts dan olingan)
const updates = [
    { id: 1, key: 'cpu', name_ru: 'Процессор', name_uz: 'Protsessor' },
    { id: 2, key: 'ram', name_ru: 'Оперативная память', name_uz: 'Operativ xotira' },
    { id: 3, key: 'storage', name_ru: 'Накопитель', name_uz: 'Xotira' },
    { id: 4, key: 'gpu', name_ru: 'Видеокарта', name_uz: 'Video karta' },
    { id: 5, key: 'os', name_ru: 'Операционная система', name_uz: 'Operatsion tizim' },
    { id: 6, key: 'case_type', name_ru: 'Тип корпуса', name_uz: 'Korpus turi' },
    { id: 12, key: 'screen_size', name_ru: 'Размер экрана', name_uz: 'Ekran o\'lchami' },
    { id: 13, key: 'resolution', name_ru: 'Разрешение', name_uz: 'Ruxsat etilgan' },
    { id: 14, key: 'refresh_rate', name_ru: 'Частота обновления', name_uz: 'Yangilanish chastotasi' },
    { id: 16, key: 'weight', name_ru: 'Вес', name_uz: 'Og\'irlik' },
    { id: 17, key: 'ports', name_ru: 'Порты', name_uz: 'Portlar' },
    { id: 18, key: 'connectivity', name_ru: 'Подключение', name_uz: 'Ulanish' },
    { id: 20, key: 'activation', name_ru: 'Активация', name_uz: 'Faollashtirish' },
    { id: 21, key: 'validity', name_ru: 'Срок действия', name_uz: 'Amal qilish muddati' },
    { id: 25, key: 'security', name_ru: 'Безопасность', name_uz: 'Xavfsizlik' },
    { id: 28, key: 'screen_type', name_ru: 'Тип экрана', name_uz: 'Ekran turi' },
    { id: 29, key: 'touchscreen', name_ru: 'Сенсорный экран', name_uz: 'Sensorli ekran' },
    { id: 32, key: 'response_time', name_ru: 'Время отклика', name_uz: 'Javob vaqti' },
    { id: 33, key: 'panel_type', name_ru: 'Тип панели', name_uz: 'Panel turi' },
    { id: 34, key: 'adaptive_sync', name_ru: 'Адаптивная синхронизация', name_uz: 'Adaptiv sinxronizatsiya' },
    { id: 35, key: 'color_gamut', name_ru: 'Цветовой охват', name_uz: 'Rang qamrovi' },
    { id: 37, key: 'aspect_ratio', name_ru: 'Соотношение сторон', name_uz: 'Tomosha nisbati' },
    { id: 41, key: 'platform', name_ru: 'Платформа', name_uz: 'Platforma' },
    { id: 42, key: 'language', name_ru: 'Язык', name_uz: 'Til' },
    { id: 43, key: 'users_count', name_ru: 'Количество пользователей', name_uz: 'Foydalanuvchilar soni' },
    { id: 58, key: 'cooling_type', name_ru: 'Тип охлаждения', name_uz: 'Sovutish turi' },
    { id: 65, key: 'stylus_support', name_ru: 'Поддержка стилуса', name_uz: 'Stylus qo\'llab-quvvatlash' },
    { id: 71, key: 'diagonal', name_ru: 'Диагональ', name_uz: 'Diagonal' },
    { id: 76, key: 'socket', name_ru: 'Сокет', name_uz: 'Socket' },
    { id: 77, key: 'core_count', name_ru: 'Количество ядер', name_uz: 'Yadrolar soni' },
    { id: 78, key: 'thread_count', name_ru: 'Количество потоков', name_uz: 'Oqimlar soni' },
    { id: 79, key: 'frequency', name_ru: 'Частота', name_uz: 'Chastota' },
    { id: 81, key: 'tdp', name_ru: 'TDP', name_uz: 'TDP' },
    { id: 85, key: 'chipset', name_ru: 'Чипсет', name_uz: 'Chipset' },
    { id: 86, key: 'form_factor', name_ru: 'Форм-фактор', name_uz: 'Forma faktori' },
    { id: 89, key: 'capacity', name_ru: 'Емкость', name_uz: 'Sig\'im' },
    { id: 91, key: 'voltage', name_ru: 'Напряжение', name_uz: 'Kuchlanish' },
    { id: 92, key: 'ecc', name_ru: 'ECC', name_uz: 'ECC' },
    { id: 93, key: 'read_speed', name_ru: 'Скорость чтения', name_uz: 'O\'qish tezligi' },
    { id: 94, key: 'write_speed', name_ru: 'Скорость записи', name_uz: 'Yozish tezligi' },
    { id: 95, key: 'power_watt', name_ru: 'Мощность (Вт)', name_uz: 'Quvvat (Vt)' },
    { id: 100, key: 'noise_level', name_ru: 'Уровень шума', name_uz: 'Shovqin darajasi' },
    { id: 101, key: 'fan_count', name_ru: 'Количество вентиляторов', name_uz: 'Ventilyatorlar soni' },
    { id: 103, key: 'rgb', name_ru: 'RGB', name_uz: 'RGB' },
    { id: 106, key: 'usb_ports', name_ru: 'USB порты', name_uz: 'USB portlar' },
    { id: 108, key: 'switch_type', name_ru: 'Тип переключателя', name_uz: 'Kalit turi' },
    { id: 109, key: 'backlight', name_ru: 'Подсветка', name_uz: 'Yoritish' },
    { id: 110, key: 'connection', name_ru: 'Подключение', name_uz: 'Ulanish' },
    { id: 112, key: 'dpi', name_ru: 'DPI', name_uz: 'DPI' },
    { id: 113, key: 'sensor_type', name_ru: 'Тип сенсора', name_uz: 'Sensor turi' },
    { id: 114, key: 'buttons_count', name_ru: 'Количество кнопок', name_uz: 'Tugmalar soni' },
    { id: 117, key: 'microphone', name_ru: 'Микрофон', name_uz: 'Mikrofon' },
    { id: 118, key: 'noise_cancellation', name_ru: 'Шумоподавление', name_uz: 'Shovqinni kamaytirish' },
    { id: 119, key: 'fps', name_ru: 'FPS', name_uz: 'FPS' },
    { id: 125, key: 'vibration', name_ru: 'Вибрация', name_uz: 'Titrash' },
    { id: 126, key: 'print_type', name_ru: 'Тип печати', name_uz: 'Bosib chiqarish turi' },
    { id: 128, key: 'format', name_ru: 'Формат', name_uz: 'Format' },
    { id: 129, key: 'speed', name_ru: 'Скорость', name_uz: 'Tezlik' },
    { id: 130, key: 'wifi', name_ru: 'Wi-Fi', name_uz: 'Wi-Fi' },
    { id: 131, key: 'duplex', name_ru: 'Двусторонняя печать', name_uz: 'Ikki tomonlama bosib chiqarish' },
    { id: 132, key: 'scanner_sensor', name_ru: 'Сенсор', name_uz: 'Sensor' },
    { id: 133, key: 'ocr', name_ru: 'OCR', name_uz: 'OCR' },
    { id: 134, key: 'backup_time', name_ru: 'Время резервного питания', name_uz: 'Zaxira quvvat vaqti' },
    { id: 135, key: 'battery_type', name_ru: 'Тип батареи', name_uz: 'Batareya turi' },
    { id: 137, key: 'protection', name_ru: 'Защита', name_uz: 'Himoya' },
    { id: 138, key: 'display', name_ru: 'Дисплей', name_uz: 'Displey' },
    { id: 140, key: 'standard', name_ru: 'Стандарт', name_uz: 'Standart' },
    { id: 141, key: 'antenna', name_ru: 'Антенна', name_uz: 'Antenna' },
    { id: 144, key: 'raid_support', name_ru: 'Поддержка RAID', name_uz: 'RAID qo\'llab-quvvatlash' },
    { id: 145, key: 'color', name_ru: 'Цвет', name_uz: 'Rang' },
    { id: 154, key: 'storage_ssdhdd', name_ru: 'Накопитель (SSD/HDD)', name_uz: 'Xotira (SSD/HDD)' },
    { id: 155, key: 'integrated_graphics', name_ru: 'Встроенная графика', name_uz: 'O\'rnatilgan grafika' },
    { id: 156, key: 'operating_system', name_ru: 'Операционная система', name_uz: 'Operatsion tizim' },
    { id: 162, key: 'power_supply', name_ru: 'Блок питания', name_uz: 'Quvvat manbai' },
    { id: 163, key: 'cooling_system', name_ru: 'Система охлаждения', name_uz: 'Sovutish tizimi' },
    { id: 169, key: 'certification_isv', name_ru: 'Сертификация (ISV)', name_uz: 'Sertifikatlash (ISV)' },
    { id: 179, key: 'graphics_type', name_ru: 'Тип графики', name_uz: 'Grafika turi' },
    { id: 180, key: 'mount_support_vesa', name_ru: 'Поддержка крепления (VESA)', name_uz: 'Mahkamlash qo\'llab-quvvatlash (VESA)' },
    { id: 186, key: 'battery_capacity', name_ru: 'Емкость батареи', name_uz: 'Batareya sig\'imi' },
    { id: 188, key: 'screen_refresh_rate', name_ru: 'Частота обновления экрана', name_uz: 'Ekran yangilanish chastotasi' },
    { id: 197, key: 'security_features', name_ru: 'Функции безопасности', name_uz: 'Xavfsizlik funksiyalari' },
    { id: 198, key: 'battery_life', name_ru: 'Время работы от батареи', name_uz: 'Batareyadan ishlash vaqti' },
    { id: 217, key: 'adjustable_stand', name_ru: 'Регулируемая подставка', name_uz: 'Sozlanishi mumkin bo\'lgan taglik' },
    { id: 222, key: 'sync_technology', name_ru: 'Технология синхронизации', name_uz: 'Sinxronizatsiya texnologiyasi' },
    { id: 228, key: 'factory_calibration', name_ru: 'Заводская калибровка', name_uz: 'Zavod kalibratsiyasi' },
    { id: 239, key: 'power_source', name_ru: 'Источник питания', name_uz: 'Quvvat manbai' },
    { id: 241, key: 'stand_type', name_ru: 'Тип подставки', name_uz: 'Taglik turi' },
    { id: 245, key: 'base_frequency', name_ru: 'Базовая частота', name_uz: 'Asosiy chastota' },
    { id: 246, key: 'turbo_frequency', name_ru: 'Турбо частота', name_uz: 'Turbo chastota' },
    { id: 249, key: 'vram_size', name_ru: 'Объем видеопамяти', name_uz: 'Video xotira hajmi' },
    { id: 250, key: 'memory_type', name_ru: 'Тип памяти', name_uz: 'Xotira turi' },
    { id: 251, key: 'outputs', name_ru: 'Выходы', name_uz: 'Chiqishlar' },
    { id: 252, key: 'power_consumption', name_ru: 'Потребление энергии', name_uz: 'Energiya iste\'moli' },
    { id: 257, key: 'ram_slots', name_ru: 'Слоты оперативной памяти', name_uz: 'Operativ xotira slotlari' },
    { id: 258, key: 'storage_interfaces', name_ru: 'Интерфейсы накопителя', name_uz: 'Xotira interfeyslari' },
    { id: 259, key: 'expansion_slots', name_ru: 'Слоты расширения', name_uz: 'Kengaytirish slotlari' },
    { id: 261, key: 'type', name_ru: 'Тип', name_uz: 'Turi' },
    { id: 265, key: 'kit_type', name_ru: 'Тип комплекта', name_uz: 'Komplekt turi' },
    { id: 267, key: 'type_ssdhdd', name_ru: 'Тип (SSD/HDD)', name_uz: 'Turi (SSD/HDD)' },
    { id: 273, key: 'efficiency_rating', name_ru: 'КПД', name_uz: 'Samaradorlik' },
    { id: 274, key: 'modular_type', name_ru: 'Тип модульности', name_uz: 'Modullik turi' },
    { id: 275, key: 'protection_features', name_ru: 'Функции защиты', name_uz: 'Himoya funksiyalari' },
    { id: 276, key: 'cooling_fan_size', name_ru: 'Размер вентилятора охлаждения', name_uz: 'Sovutish ventilyatori o\'lchami' },
    { id: 278, key: 'type_airliquid', name_ru: 'Тип (Воздушное/Жидкостное)', name_uz: 'Turi (Havo/Suyuq)' },
    { id: 279, key: 'socket_support', name_ru: 'Поддержка сокетов', name_uz: 'Socket qo\'llab-quvvatlash' },
    { id: 280, key: 'fan_size', name_ru: 'Размер вентилятора', name_uz: 'Ventilyator o\'lchami' },
    { id: 282, key: 'tdp_support', name_ru: 'Поддержка TDP', name_uz: 'TDP qo\'llab-quvvatlash' },
    { id: 283, key: 'rgb_support', name_ru: 'Поддержка RGB', name_uz: 'RGB qo\'llab-quvvatlash' },
    { id: 285, key: 'material', name_ru: 'Материал', name_uz: 'Material' },
    { id: 286, key: 'cooling_support', name_ru: 'Поддержка охлаждения', name_uz: 'Sovutish qo\'llab-quvvatlash' },
    { id: 287, key: 'drive_bays', name_ru: 'Отсеки для накопителей', name_uz: 'Xotira uchun bo\'limlar' },
    { id: 288, key: 'front_ports', name_ru: 'Передние порты', name_uz: 'Old portlar' },
    { id: 294, key: 'layout', name_ru: 'Раскладка', name_uz: 'Tartib' },
    { id: 295, key: 'wrist_rest', name_ru: 'Подставка для запястий', name_uz: 'Bilak tagligi' },
    { id: 305, key: 'frequency_range', name_ru: 'Частотный диапазон', name_uz: 'Chastota diapazoni' },
    { id: 309, key: 'frame_rate', name_ru: 'Частота кадров', name_uz: 'Kadr chastotasi' },
    { id: 310, key: 'autofocus', name_ru: 'Автофокус', name_uz: 'Avtofokus' },
    { id: 312, key: 'mount_type', name_ru: 'Тип крепления', name_uz: 'Mahkamlash turi' },
    { id: 315, key: 'polar_pattern', name_ru: 'Полярная диаграмма', name_uz: 'Polar diagramma' },
    { id: 318, key: 'stand_included', name_ru: 'Подставка в комплекте', name_uz: 'Taglik komplektda' },
    { id: 319, key: 'use_case', name_ru: 'Область применения', name_uz: 'Qo\'llash sohasi' },
    { id: 320, key: 'platform_support', name_ru: 'Поддержка платформ', name_uz: 'Platformalar qo\'llab-quvvatlash' },
    { id: 327, key: 'print_speed', name_ru: 'Скорость печати', name_uz: 'Bosib chiqarish tezligi' },
    { id: 330, key: 'duplex_support', name_ru: 'Поддержка двусторонней печати', name_uz: 'Ikki tomonlama bosib chiqarish qo\'llab-quvvatlash' },
    { id: 331, key: 'paper_size', name_ru: 'Размер бумаги', name_uz: 'Qog\'oz o\'lchami' },
    { id: 332, key: 'functions', name_ru: 'Функции', name_uz: 'Funksiyalar' },
    { id: 334, key: 'scan_resolution', name_ru: 'Разрешение сканирования', name_uz: 'Skanerlash ruxsati' },
    { id: 337, key: 'adf_support', name_ru: 'Поддержка ADF', name_uz: 'ADF qo\'llab-quvvatlash' },
    { id: 338, key: 'scan_type', name_ru: 'Тип сканирования', name_uz: 'Skanerlash turi' },
    { id: 340, key: 'scan_speed', name_ru: 'Скорость сканирования', name_uz: 'Skanerlash tezligi' },
    { id: 342, key: 'adf', name_ru: 'ADF', name_uz: 'ADF' },
    { id: 343, key: 'max_paper_size', name_ru: 'Максимальный размер бумаги', name_uz: 'Maksimal qog\'oz o\'lchami' },
    { id: 344, key: 'capacity_va', name_ru: 'Мощность (ВА)', name_uz: 'Quvvat (VA)' },
    { id: 345, key: 'output_power', name_ru: 'Выходная мощность', name_uz: 'Chiqish quvvati' },
    { id: 348, key: 'outlets', name_ru: 'Розетки', name_uz: 'Rozetkalar' },
    { id: 351, key: 'warm_up_time', name_ru: 'Время прогрева', name_uz: 'Ishlash vaqti' },
    { id: 352, key: 'lamination_thickness', name_ru: 'Толщина ламинации', name_uz: 'Laminatsiya qalinligi' },
    { id: 354, key: 'temperature_control', name_ru: 'Контроль температуры', name_uz: 'Harorat nazorati' },
    { id: 355, key: 'use_type', name_ru: 'Тип использования', name_uz: 'Ishlatish turi' },
    { id: 356, key: 'cut_type', name_ru: 'Тип резки', name_uz: 'Kesish turi' },
    { id: 357, key: 'sheet_capacity', name_ru: 'Емкость листов', name_uz: 'Varaqlar sig\'imi' },
    { id: 358, key: 'security_level', name_ru: 'Уровень безопасности', name_uz: 'Xavfsizlik darajasi' },
    { id: 359, key: 'bin_capacity', name_ru: 'Емкость контейнера', name_uz: 'Konteyner sig\'imi' },
    { id: 360, key: 'continuous_run_time', name_ru: 'Время непрерывной работы', name_uz: 'Uzluksiz ishlash vaqti' },
    { id: 362, key: 'wi_fi_standard', name_ru: 'Стандарт Wi-Fi', name_uz: 'Wi-Fi standarti' },
    { id: 364, key: 'bands', name_ru: 'Диапазоны', name_uz: 'Diapazonlar' },
    { id: 366, key: 'antennas', name_ru: 'Антенны', name_uz: 'Antennalar' },
    { id: 368, key: 'ports_count', name_ru: 'Количество портов', name_uz: 'Portlar soni' },
    { id: 370, key: 'managed_type', name_ru: 'Тип управления', name_uz: 'Boshqaruv turi' },
    { id: 371, key: 'rack_mountable', name_ru: 'Монтаж в стойку', name_uz: 'Stoykaga o\'rnatish' },
    { id: 372, key: 'poe_support', name_ru: 'Поддержка PoE', name_uz: 'PoE qo\'llab-quvvatlash' },
    { id: 375, key: 'coverage_area', name_ru: 'Зона покрытия', name_uz: 'Qamrov zonasi' },
    { id: 377, key: 'power_method', name_ru: 'Способ питания', name_uz: 'Quvvatlash usuli' },
    { id: 378, key: 'max_clients', name_ru: 'Максимальное количество клиентов', name_uz: 'Maksimal mijozlar soni' },
    { id: 380, key: 'connection_type', name_ru: 'Тип подключения', name_uz: 'Ulanish turi' },
    { id: 382, key: 'isp_compatibility', name_ru: 'Совместимость с провайдером', name_uz: 'Provayder bilan mos keluvchanlik' },
    { id: 384, key: 'wi_fi_support', name_ru: 'Поддержка Wi-Fi', name_uz: 'Wi-Fi qo\'llab-quvvatlash' },
    { id: 390, key: 'os_support', name_ru: 'Поддержка ОС', name_uz: 'OS qo\'llab-quvvatlash' },
    { id: 402, key: 'shock_resistance', name_ru: 'Ударопрочность', name_uz: 'Zarbaga chidamlilik' },
    { id: 410, key: 'bays_count', name_ru: 'Количество отсеков', name_uz: 'Bo\'limlar soni' },
    { id: 414, key: 'network_speed', name_ru: 'Скорость сети', name_uz: 'Tarmoq tezligi' },
    { id: 416, key: 'supported_cards', name_ru: 'Поддерживаемые карты', name_uz: 'Qo\'llab-quvvatlanadigan kartalar' },
    { id: 419, key: 'slots_count', name_ru: 'Количество слотов', name_uz: 'Slotlar soni' },
    { id: 423, key: 'size_compatibility', name_ru: 'Совместимость размеров', name_uz: 'O\'lchamlar mos keluvchanligi' },
    { id: 425, key: 'compartments', name_ru: 'Отделения', name_uz: 'Bo\'limlar' },
    { id: 426, key: 'waterproof', name_ru: 'Водонепроницаемость', name_uz: 'Suv o\'tkazmaslik' },
    { id: 429, key: 'size_support', name_ru: 'Поддержка размеров', name_uz: 'O\'lchamlar qo\'llab-quvvatlash' },
    { id: 432, key: 'adjustable_height', name_ru: 'Регулируемая высота', name_uz: 'Sozlanishi mumkin bo\'lgan balandlik' },
    { id: 435, key: 'length', name_ru: 'Длина', name_uz: 'Uzunlik' },
    { id: 436, key: 'connector', name_ru: 'Разъем', name_uz: 'Ulanish' },
    { id: 437, key: 'data_speed', name_ru: 'Скорость передачи данных', name_uz: 'Ma\'lumot uzatish tezligi' },
    { id: 438, key: 'shielding', name_ru: 'Экранирование', name_uz: 'Ekranlash' },
    { id: 440, key: 'power_output', name_ru: 'Выходная мощность', name_uz: 'Chiqish quvvati' },
    { id: 441, key: 'connector_type', name_ru: 'Тип разъема', name_uz: 'Ulanish turi' },
    { id: 442, key: 'fast_charge', name_ru: 'Быстрая зарядка', name_uz: 'Tez zaryadlash' },
    { id: 444, key: 'cable_included', name_ru: 'Кабель в комплекте', name_uz: 'Kabel komplektda' },
    { id: 450, key: 'life_cycle', name_ru: 'Жизненный цикл', name_uz: 'Hayotiy tsikl' },
    { id: 451, key: 'dimensions', name_ru: 'Габариты', name_uz: 'O\'lchamlar' },
    { id: 453, key: 'architecture', name_ru: 'Архитектура', name_uz: 'Arxitektura' },
    { id: 454, key: 'language_support', name_ru: 'Поддержка языков', name_uz: 'Tillarni qo\'llab-quvvatlash' },
    { id: 455, key: 'activation_type', name_ru: 'Тип активации', name_uz: 'Faollashtirish turi' },
    { id: 459, key: 'included_apps', name_ru: 'Включенные приложения', name_uz: 'Kiritilgan ilovalar' },
    { id: 462, key: 'subscription', name_ru: 'Подписка', name_uz: 'Obuna' },
    { id: 464, key: 'license_duration', name_ru: 'Срок действия лицензии', name_uz: 'Litsenziya muddati' },
    { id: 466, key: 'protection_type', name_ru: 'Тип защиты', name_uz: 'Himoya turi' },
    { id: 468, key: 'updates', name_ru: 'Обновления', name_uz: 'Yangilanishlar' },
    { id: 469, key: 'firewall', name_ru: 'Файрвол', name_uz: 'Firewall' },
    { id: 475, key: 'support', name_ru: 'Поддержка', name_uz: 'Qo\'llab-quvvatlash' },
    { id: 476, key: 'product_type', name_ru: 'Тип продукта', name_uz: 'Mahsulot turi' },
    { id: 481, key: 'delivery_method', name_ru: 'Способ доставки', name_uz: 'Yetkazib berish usuli' },
];

async function applyTranslations() {
    const client = await pool.connect();
    
    try {
        console.log('🚀 Xarakteristikalar tarjimalarini yangilash boshlandi...\n');
        console.log(`📊 Jami yangilanishlar: ${updates.length}\n`);
        console.log('⚠️  DIQQAT: Bu operatsiya bazaga yozadi!');
        console.log('Davom etishni tasdiqlash uchun scriptni o\'zgartiring va tasdiqlash flagini qo\'shing.\n');

        // Tasdiqlash flagi - agar true bo'lsa, bazaga yozadi
        const CONFIRMED = true; // <-- Bu yerni true qiling va scriptni qayta ishga tushiring

        if (!CONFIRMED) {
            console.log('❌ Operatsiya tasdiqlanmagan. Bazaga yozilmadi.');
            console.log('✅ Tarjimalar ko\'rsatildi. Agar tasdiqlasangiz, scriptdagi CONFIRMED flagini true qiling.');
            return;
        }

        console.log('✅ Operatsiya tasdiqlandi. Bazaga yozilmoqda...\n');

        let successCount = 0;
        let errorCount = 0;

        for (const update of updates) {
            try {
                await client.query(
                    `UPDATE characteristics SET name_ru = $1, name_uz = $2 WHERE id = $3`,
                    [update.name_ru, update.name_uz, update.id]
                );
                console.log(`  ✅ ${update.key} (ID: ${update.id}) yangilandi`);
                successCount++;
            } catch (e: any) {
                console.error(`  ❌ ${update.key} (ID: ${update.id}) xatolik: ${e.message}`);
                errorCount++;
            }
        }

        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('📊 NATIJA');
        console.log('═══════════════════════════════════════════════════════════════\n');
        console.log(`✅ Muvaffaqiyatli yangilandi: ${successCount} ta`);
        if (errorCount > 0) {
            console.log(`❌ Xatoliklar: ${errorCount} ta`);
        }
        console.log(`📦 Jami: ${updates.length} ta`);

    } catch (e) {
        console.error('\n❌ Xatolik:', e);
        throw e;
    } finally {
        client.release();
        await pool.end();
    }
}

applyTranslations();

