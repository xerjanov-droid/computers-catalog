CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    category VARCHAR(50),
    description TEXT,
    updated_at TIMESTAMP DEFAULT now()
);

-- Seed defaults
INSERT INTO settings (key, value, category, description) VALUES
('general', '{"project_name": "Antigravity Store", "logo_light": "", "logo_dark": "", "default_currency": "UZS", "date_format": "DD.MM.YYYY", "timezone": "Asia/Tashkent"}', 'general', 'General project settings') ON CONFLICT DO NOTHING;

INSERT INTO settings (key, value, category, description) VALUES
('localization', '{"active_languages": ["uz", "ru", "en"], "default_language": "ru", "fallback_language": "en", "missing_translation_behavior": "show_key"}', 'localization', 'Language settings') ON CONFLICT DO NOTHING;

INSERT INTO settings (key, value, category, description) VALUES
('catalog', '{"price_visible": true, "default_product_status": "in_stock", "sku_auto_generate": true, "max_images": 5, "max_image_size_mb": 5}', 'catalog', 'Catalog configuration') ON CONFLICT DO NOTHING;

INSERT INTO settings (key, value, category, description) VALUES
('filters', '{"location": "sidebar", "hide_empty": true, "default_order": "asc", "clear_behavior": "reset_all"}', 'filters', 'Filter settings') ON CONFLICT DO NOTHING;

INSERT INTO settings (key, value, category, description) VALUES
('orders', '{"b2b_statuses": ["new", "processing", "completed", "cancelled"], "default_b2b_status": "new", "email_notification": true, "admin_notification": true}', 'orders', 'Orders and B2B settings') ON CONFLICT DO NOTHING;

INSERT INTO settings (key, value, category, description) VALUES
('security', '{"session_timeout_min": 60, "login_attempt_limit": 5, "password_policy": "min_length_8"}', 'security', 'Security settings') ON CONFLICT DO NOTHING;
