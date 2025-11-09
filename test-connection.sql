-- =====================================================
-- TEST DATABASE CONNECTION AND DATA
-- Run these queries one by one to verify everything works
-- =====================================================

-- 1. Check if tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Check products data
SELECT id, name, price, stock, category, status 
FROM public.products 
LIMIT 10;

-- 3. Check users table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public';

-- 4. Check if RLS policies are active
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- 5. Test product count
SELECT 
  category,
  COUNT(*) as product_count,
  SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_products
FROM public.products 
GROUP BY category;

-- 6. Check settings
SELECT key, value, description 
FROM public.settings;

-- 7. Test if you can insert a test product (as admin)
-- INSERT INTO public.products (name, description, price, stock, category, status) 
-- VALUES ('Test Product', 'This is a test', 10.00, 5, 'water', 'active');

-- 8. Check auth users (this might fail due to RLS, which is normal)
-- SELECT id, email, created_at FROM auth.users LIMIT 5;
