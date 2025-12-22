-- 10. Filters Configurator
-- This table controls which filters appear in the user-facing catalog for a specific subcategory.

CREATE TABLE IF NOT EXISTS category_filters (
  id SERIAL PRIMARY KEY,
  subcategory_id INT REFERENCES categories(id) ON DELETE CASCADE,
  characteristic_id INT REFERENCES characteristics(id) ON DELETE CASCADE, -- Nullable if it's a custom filter (price, brand)
  
  type VARCHAR(50) NOT NULL, -- 'select', 'range', 'checkbox'
  
  -- Labels for filters that might not be directly linked to a characteristic or need override
  label_uz VARCHAR(100),
  label_ru VARCHAR(100),
  label_en VARCHAR(100),
  
  is_enabled BOOLEAN DEFAULT true,
  order_index INT DEFAULT 0,
  
  -- Settings for 'range' type
  min_value NUMERIC(12,2),
  max_value NUMERIC(12,2),
  
  -- Settings for 'select' type
  is_multiselect BOOLEAN DEFAULT false,

  -- Metadata
  source_type VARCHAR(50) DEFAULT 'characteristic', -- 'characteristic', 'price', 'brand'
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP
);

-- Index for fast lookup by subcategory
CREATE INDEX IF NOT EXISTS idx_category_filters_subcategory ON category_filters(subcategory_id);
