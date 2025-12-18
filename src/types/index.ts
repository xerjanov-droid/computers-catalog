export interface Category {
    id: number;
    parent_id?: number | null;
    name_ru: string;
    name_uz: string;
    name_en: string;
    icon?: string;
    order_index: number;
    is_active: boolean;
    children?: Category[]; // For UI tree structure
}

export interface Product {
    id: number;
    category_id: number;
    brand: string;
    model: string;
    sku: string;
    title_ru: string;
    title_uz: string;
    title_en: string;
    technology: 'laser' | 'inkjet' | string;
    color_print: boolean;
    format: 'A4' | 'A3' | string;
    wifi: boolean;
    duplex: boolean;
    price: number;
    currency: string;
    status: 'in_stock' | 'pre_order' | 'showroom';
    delivery_days?: number;
    short_specs_ru?: string;
    short_specs_uz?: string;
    short_specs_en?: string;
    images?: string[]; // derived from relation
    specs?: { id: number; spec_key: string; spec_value: string }[];
    files?: { id: number; file_type: string; file_url: string }[];
    views?: number;
    created_at: string;
    updated_at?: string;
}

export interface B2BRequest {
    id: number;
    telegram_id: number;
    type: 'invoice' | 'consultation';
    message?: string;
    created_at: string;
}

export type Language = 'ru' | 'uz' | 'en';
