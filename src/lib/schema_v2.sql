-- 1. Roles & Permissions (RBAC)
CREATE TABLE IF NOT EXISTS roles (
  slug VARCHAR(50) PRIMARY KEY, -- admin, manager, viewer
  name VARCHAR(100),
  permissions JSONB DEFAULT '[]'::jsonb -- ["product:read", "product:write", "price:edit"]
);

INSERT INTO roles (slug, name, permissions) VALUES
('admin', 'Administrator', '["*"]'),
('manager', 'Manager', '["product:read", "product:write", "order:read", "order:write"]'),
('viewer', 'Viewer', '["product:read", "order:read"]')
ON CONFLICT (slug) DO NOTHING;

-- 2. Admin Users (Updated)
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS role_slug VARCHAR(50) REFERENCES roles(slug) DEFAULT 'viewer';
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS full_name VARCHAR(100);
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 3. Product Statuses (Lookup)
CREATE TABLE IF NOT EXISTS product_statuses (
  slug VARCHAR(50) PRIMARY KEY,
  name_ru VARCHAR(100),
  name_uz VARCHAR(100),
  name_en VARCHAR(100),
  color VARCHAR(20) DEFAULT 'gray' -- for UI badges
);

INSERT INTO product_statuses (slug, name_ru, name_uz, name_en, color) VALUES
('in_stock', 'В наличии', 'Mavjud', 'In Stock', 'green'),
('on_order', 'Под заказ', 'Buyurtma asosida', 'On Order', 'blue'),
('showroom', 'В шоуруме', 'Shourumda', 'In Showroom', 'purple'),
('out_of_stock', 'Нет в наличии', 'Mavjud emas', 'Out of Stock', 'red')
ON CONFLICT (slug) DO NOTHING;

-- 4. Audit Logs (Mandatory)
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL, -- product, category, order, user
  entity_id INT NOT NULL,
  action VARCHAR(50) NOT NULL, -- create, update, delete, status_change
  before_data JSONB,
  after_data JSONB,
  admin_user_id INT REFERENCES admin_users(id),
  created_at TIMESTAMP DEFAULT now()
);

-- 5. Characteristics Dictionary
CREATE TABLE IF NOT EXISTS characteristics (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL, -- cpu_model, ram_size
  type VARCHAR(20) NOT NULL, -- text, number, boolean, select, multiselect, range
  name_ru VARCHAR(100) NOT NULL,
  name_uz VARCHAR(100),
  name_en VARCHAR(100),
  options JSONB, -- ["8GB", "16GB"] or [{"label":"X", "value":"Y"}]
  is_filterable BOOLEAN DEFAULT true
);

-- 6. Category <> Characteristics Mapping
CREATE TABLE IF NOT EXISTS category_characteristics (
  category_id INT REFERENCES categories(id) ON DELETE CASCADE,
  characteristic_id INT REFERENCES characteristics(id) ON DELETE CASCADE,
  order_index INT DEFAULT 0,
  is_required BOOLEAN DEFAULT false,
  show_in_key_specs BOOLEAN DEFAULT false,
  PRIMARY KEY (category_id, characteristic_id)
);

-- 7. Update Products for Schema V2
-- Convert status column to use lookup if possible, or just add FK constraint logic application side
-- For now, we keep status string but valid values should be checked against product_statuses

-- 8. Enhanced B2B Requests
ALTER TABLE b2b_requests ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'new'; -- new, in_progress, completed, rejected
ALTER TABLE b2b_requests ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;
ALTER TABLE b2b_requests ADD COLUMN IF NOT EXISTS admin_comment TEXT;
ALTER TABLE b2b_requests ADD COLUMN IF NOT EXISTS updated_by INT REFERENCES admin_users(id);

-- 9. Generic Dictionary for common use (Countries, Manufacturers etc) - Optional but good
CREATE TABLE IF NOT EXISTS dictionary (
    group_key VARCHAR(50),
    key VARCHAR(50),
    value_ru VARCHAR(100),
    PRIMARY KEY (group_key, key)
);
