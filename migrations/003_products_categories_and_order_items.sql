-- Add category and additional product fields
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS sku TEXT,
  ADD COLUMN IF NOT EXISTS weight NUMERIC,
  ADD COLUMN IF NOT EXISTS unit TEXT;

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);

-- Create order_items table to normalize items referenced in frontend
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  product_name TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- Backfill optional categories for existing seed data (best-effort defaults)
UPDATE public.products
SET category = COALESCE(category, CASE
  WHEN name ILIKE '%fruit%' THEN 'fruits_vegetables'
  WHEN name ILIKE '%vegetable%' THEN 'fruits_vegetables'
  WHEN name ILIKE '%essential%' THEN 'groceries'
  WHEN name ILIKE '%water%' THEN 'water'
  ELSE 'groceries'
END);


