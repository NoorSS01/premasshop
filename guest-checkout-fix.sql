-- GUEST CHECKOUT FIX - Allow orders without user accounts
-- This fixes the Supabase user limit issue by enabling guest checkout

-- 1. Modify orders table to allow NULL user_id for guest orders
ALTER TABLE public.orders 
ALTER COLUMN user_id DROP NOT NULL;

-- 2. Add guest customer info fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS guest_name TEXT,
ADD COLUMN IF NOT EXISTS guest_email TEXT,
ADD COLUMN IF NOT EXISTS guest_phone TEXT;

-- 3. Create index for guest orders
CREATE INDEX IF NOT EXISTS idx_orders_guest ON public.orders(guest_phone, created_at) 
WHERE user_id IS NULL;

-- 4. Update RLS policy to allow guest orders
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" ON public.orders
FOR SELECT USING (
  auth.uid() = user_id OR 
  user_id IS NULL -- Allow viewing guest orders
);

DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
CREATE POLICY "Users can create their own orders" ON public.orders
FOR INSERT WITH CHECK (
  auth.uid() = user_id OR 
  user_id IS NULL -- Allow creating guest orders
);

-- 5. Ensure products are always available
INSERT INTO public.products (name, description, price, cost_price, stock, category, status, images, sku, weight, unit) VALUES
('Aquafina Water Bottle', 'Pure drinking water in 1L bottle', 20.00, 15.00, 100, 'water', 'active', ARRAY['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400'], 'AQF-1L-001', '1L', 'bottle'),
('Bisleri Water Bottle', 'Premium mineral water 500ml', 15.00, 10.00, 150, 'water', 'active', ARRAY['https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400'], 'BIS-500ML-001', '500ml', 'bottle'),
('Kinley Water Bottle', 'Refreshing drinking water 2L', 35.00, 25.00, 80, 'water', 'active', ARRAY['https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400'], 'KIN-2L-001', '2L', 'bottle'),
('Premium Spring Water', 'Natural spring water with minerals', 45.00, 30.00, 60, 'water', 'active', ARRAY['https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400'], 'PSW-1L-001', '1L', 'bottle'),
('Eco-Friendly Water Pack', 'Sustainable water packaging', 25.00, 18.00, 120, 'water', 'active', ARRAY['https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400'], 'ECO-1L-001', '1L', 'pack')
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  stock = EXCLUDED.stock,
  status = EXCLUDED.status,
  updated_at = NOW();

-- 6. Verification
SELECT 
  'GUEST CHECKOUT ENABLED!' as status,
  (SELECT COUNT(*) FROM public.products WHERE status = 'active') as active_products,
  'Orders table now accepts NULL user_id for guest checkout' as note;
