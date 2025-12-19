export interface Category {
    id: number;
    parent_id?: number | null;
    slug?: string;
    name_ru: string;
    name_uz: string;
    name_en: string;
    icon?: string;
    children?: Category[]; // For UI tree structure
}

export interface Product {
    id: number;
    category_id: number;
    category_slug: string; // Calculated (Main Category)
    subcategory_slug?: string; // Calculated (Sub Category)
    brand: string;
    model: string;
    sku: string;
    title_ru: string;
    title_uz?: string;
    title_en?: string;
    price: number;
    currency: string;
    status: 'in_stock' | 'pre_order' | 'showroom';
    delivery_days?: number;
    short_specs_ru?: string;
    short_specs_uz?: string;
    short_specs_en?: string;
    images?: string[];

    // Logic: JSONB specs matching Characteristics config
    specs?: Record<string, string | number | boolean>;

    files?: { id: number; file_type: string; file_url: string }[];
    views?: number;
    created_at: string;
    updated_at?: string;

    // Legacy fields handling (optional):
    technology?: string;
    color_print?: boolean;
    format?: string;
    wifi?: boolean;
}

export interface B2BRequest {
    id: number;
    telegram_id: number;
    type: 'invoice' | 'consultation';
    message?: string;
    created_at: string;
}

export type Language = 'ru' | 'uz' | 'en';
