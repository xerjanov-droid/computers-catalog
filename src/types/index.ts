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
    status: 'in_stock' | 'on_order' | 'showroom' | 'out_of_stock';
    image_url?: string;
    images?: string[];
    // Dynamic specs
    specs: Record<string, any>;
    // Relations
    category_name_ru?: string;
    created_at?: Date;
}

export interface Characteristic {
    id: number;
    key: string;
    type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'range';
    name_ru: string;
    name_uz?: string;
    name_en?: string;
    options?: any[]; // JSON
    is_filterable: boolean;
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
