-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  parent_id INT REFERENCES categories(id),
  slug VARCHAR(100) UNIQUE,
  name_ru VARCHAR(100) NOT NULL,
  name_uz VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  icon VARCHAR(100),
  order_index INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  category_id INT REFERENCES categories(id),
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  title_ru VARCHAR(255) NOT NULL,
  title_uz VARCHAR(255),
  title_en VARCHAR(255),
  
  technology VARCHAR(50),   -- laser / inkjet
  color_print BOOLEAN DEFAULT false,
  format VARCHAR(10) DEFAULT 'A4',   -- A4 / A3
  wifi BOOLEAN DEFAULT false,
  duplex BOOLEAN DEFAULT false,
  
  specs JSONB DEFAULT '{}'::jsonb, -- New dynamic specs container

  price NUMERIC(12,2) DEFAULT 0,
  currency VARCHAR(5) DEFAULT 'UZS',
  
  status VARCHAR(30) DEFAULT 'in_stock',   -- in_stock / on_order / showroom
  delivery_days INT DEFAULT 1,
  views INT DEFAULT 0,
  
  short_specs_ru TEXT,
  short_specs_uz TEXT,
  short_specs_en TEXT,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP
);

-- Product Images
CREATE TABLE IF NOT EXISTS product_images (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  order_index INT DEFAULT 0
);

-- Product Files (Manuals/Datasheets)
CREATE TABLE IF NOT EXISTS product_files (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  file_type VARCHAR(30),   -- manual / datasheet
  file_url TEXT NOT NULL
);

-- Favorites
CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT NOT NULL,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(telegram_id, product_id)
);

-- B2B Requests
CREATE TABLE IF NOT EXISTS b2b_requests (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT NOT NULL,
  type VARCHAR(50) NOT NULL,  -- invoice / consultation
  message TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Admin Users (Simple)
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT now()
);

-- Logs
CREATE TABLE IF NOT EXISTS logs (
  id SERIAL PRIMARY KEY,
  level VARCHAR(20),
  message TEXT,
  meta JSONB,
  created_at TIMESTAMP DEFAULT now()
);
