-- =====================================================
-- QUICK FIX: ADD PRODUCTS ONLY
-- Run this in Supabase SQL Editor to add products
-- =====================================================

-- Delete any existing products (optional - remove if you want to keep existing)
TRUNCATE TABLE public.products CASCADE;

-- Add products one by one
INSERT INTO public.products (name, description, price, cost_price, stock, category, status, images, sku, weight, unit, created_at, updated_at) VALUES
('Aquafina Water Bottle', 'Pure drinking water in 1L bottle', 20.00, 15.00, 100, 'water', 'active', ARRAY['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400'], 'AQF-1L-001', '1L', 'bottle', NOW(), NOW());

INSERT INTO public.products (name, description, price, cost_price, stock, category, status, images, sku, weight, unit, created_at, updated_at) VALUES
('Bisleri Water Bottle', 'Premium mineral water 500ml', 15.00, 10.00, 150, 'water', 'active', ARRAY['https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400'], 'BIS-500ML-001', '500ml', 'bottle', NOW(), NOW());

INSERT INTO public.products (name, description, price, cost_price, stock, category, status, images, sku, weight, unit, created_at, updated_at) VALUES
('Kinley Water Bottle', 'Refreshing drinking water 2L', 35.00, 25.00, 80, 'water', 'active', ARRAY['https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400'], 'KIN-2L-001', '2L', 'bottle', NOW(), NOW());

INSERT INTO public.products (name, description, price, cost_price, stock, category, status, images, sku, weight, unit, created_at, updated_at) VALUES
('Premium Spring Water', 'Natural spring water with minerals', 45.00, 30.00, 60, 'water', 'active', ARRAY['https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400'], 'PSW-1L-001', '1L', 'bottle', NOW(), NOW());

-- Verify products were added
SELECT 'Products added successfully!' as status, COUNT(*) as total_products FROM public.products;
