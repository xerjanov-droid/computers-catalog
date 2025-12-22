export interface Category {
    id: number;
    parent_id: number | null;
    slug: string;
    name_ru: string;
    name_uz: string;
    name_en: string;
    icon?: string;
    order_index: number;
    is_active: boolean;
    children?: Category[];
    product_count?: number; // Aggregated count (direct + children)
    characteristic_count?: number; // Added for display
}

export interface Product {
    id: number;
    category_id: number;
    brand: string;
    model: string;
    sku?: string;
    title_ru: string;
    title_uz?: string;
    title_en?: string;
    price: number;
    currency: string;
    // Status is now stricter, but still a string in DB/Join
    status: 'in_stock' | 'pre_order' | 'showroom' | 'archived';
    image_url?: string;
    images?: { id: number; image_url: string; is_cover: boolean }[];
    // Dynamic specs
    specs: Record<string, any>;
    // Relations
    category_name_ru?: string;
    category_slug?: string;
    subcategory_slug?: string;
    files?: { id: number; file_url: string; file_type: string }[];
    wifi?: boolean;
    duplex?: boolean;
    color_print?: boolean;
    is_price_visible?: boolean;
    created_at?: Date;
}

export interface Characteristic {
    id: number;
    key: string;
    type: 'text' | 'number' | 'boolean' | 'select';
    name_ru: string;
    name_uz: string;
    name_en: string;
    is_filterable: boolean;
    is_active: boolean;
    options?: CharacteristicOption[];
    created_at?: Date;
}

export interface CharacteristicOption {
    id?: number;
    value: string;
    label_ru: string;
    label_uz: string;
    label_en: string;
    order_index: number;
}

export interface CategoryCharacteristic {
    category_id: number;
    characteristic_id: number;
    order_index: number;
    is_required: boolean;
    show_in_key_specs: boolean;
    // Joined data
    characteristic?: Characteristic;
}

export interface AuditLog {
    id: number;
    entity_type: string;
    entity_id: number;
    action: string;
    before_data?: any;
    after_data?: any;
    admin_user_id?: number;
    created_at: Date;
}

export interface AdminUser {
    id: number;
    username: string;
    full_name?: string;
    role_slug: string;
    is_active: boolean;
}

export interface B2BRequest {
    id: number;
    telegram_id: number;
    type: string;
    message?: string;
    status: 'new' | 'in_progress' | 'completed' | 'rejected';
    items?: any[];
    admin_comment?: string;
    updated_by?: number;
    created_at: Date;
}
