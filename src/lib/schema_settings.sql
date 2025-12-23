-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    category VARCHAR(50) NOT NULL, -- 'general', 'localization', 'catalog', 'filters', 'orders', 'security', 'system'
    description TEXT,
    updated_by INT, -- References users(id) or admin_users(id) depending on your schema
    updated_at TIMESTAMP DEFAULT now(),
    created_at TIMESTAMP DEFAULT now()
);

-- System Logs Table (separate from audit_logs)
CREATE TABLE IF NOT EXISTS system_logs (
    id SERIAL PRIMARY KEY,
    level VARCHAR(20) NOT NULL, -- 'error', 'warn', 'info', 'debug'
    message TEXT NOT NULL,
    context JSONB DEFAULT '{}'::jsonb,
    error_code VARCHAR(50),
    user_id INT, -- References users(id) or admin_users(id) depending on your schema
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Default Settings
INSERT INTO settings (key, value, category, description) VALUES
('project_name', '"Computers Catalog"', 'general', 'Loyiha nomi'),
('default_language', '"uz"', 'general', 'Default til (uz/ru/en)'),
('default_currency', '"UZS"', 'general', 'Default valyuta'),
('date_format', '"DD.MM.YYYY"', 'general', 'Sana formati'),
('time_format', '"HH:mm"', 'general', 'Vaqt formati'),
('timezone', '"Asia/Tashkent"', 'general', 'Timezone'),
('active_languages', '["uz", "ru", "en"]', 'localization', 'Faol tillar'),
('fallback_language', '"en"', 'localization', 'Fallback til'),
('price_visible_default', 'true', 'catalog', 'Narx ko''rsatish default holati'),
('default_product_status', '"in_stock"', 'catalog', 'Default product status'),
('sku_auto_generate', 'true', 'catalog', 'SKU auto-generate'),
('max_images_per_product', '10', 'catalog', 'Bir mahsulotga max rasm soni'),
('max_image_size_mb', '5', 'catalog', 'Rasm maksimal hajmi (MB)'),
('show_filters_on', '"category_page"', 'filters', 'Filtrlar qaysi sahifada chiqsin'),
('hide_empty_filters', 'true', 'filters', 'Bo''sh filtrlarni yashirish'),
('default_b2b_status', '"new"', 'orders', 'Default B2B status'),
('email_notifications', 'true', 'orders', 'Email notification'),
('admin_notifications', 'true', 'orders', 'Admin notification'),
('session_timeout_minutes', '60', 'security', 'Session timeout (min)'),
('login_attempt_limit', '5', 'security', 'Login attempt limit'),
('maintenance_mode', 'false', 'system', 'Maintenance mode')
ON CONFLICT (key) DO NOTHING;

