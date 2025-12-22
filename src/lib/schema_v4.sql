-- 12. Roles & Permissions
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP
);

-- 13. Users (Admin Panel Users)
-- If admin_users exists, we might want to migrate data or drop it. 
-- For now, creating 'users' table as the main auth table.
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100),
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT REFERENCES roles(id),
  status VARCHAR(20) DEFAULT 'active', -- active, blocked
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP
);

-- Seed Roles
INSERT INTO roles (name, slug, permissions) VALUES 
('Super Admin', 'super_admin', '{"all": true}'),
('Manager', 'manager', '{"products": true, "categories": true, "orders": true}'),
('Viewer', 'viewer', '{"products": ["view"], "orders": ["view"]}')
ON CONFLICT (slug) DO NOTHING;

-- 14. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL, -- 'user', 'product', 'role'
    entity_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,      -- 'create', 'update', 'delete', 'login', 'block'
    before_data JSONB,
    after_data JSONB,
    admin_user_id INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT now()
);

-- Initial Super Admin (password: admin123)
-- We need to insert this if it doesn't exist. 
-- Note: The hash below is for 'admin123' using the scrypt logic from auth.ts if possible, 
-- but since salt is random, I can't hardcode a valid scrypt hash easily without the salt.
-- I'll create a seeding script for the user.
