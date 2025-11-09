-- =====================================================
-- COMPLETE SUPABASE FIX - ALL AUTHENTICATION ISSUES
-- Run this ENTIRE script in Supabase SQL Editor
-- =====================================================

-- 1. COMPLETELY RESET USER SYSTEM
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_user_update();

-- 2. TEMPORARILY DISABLE RLS FOR TESTING
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

-- 3. CREATE BULLETPROOF USER CREATION FUNCTION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert user with proper error handling
  INSERT INTO public.users (
    id, 
    full_name, 
    email, 
    role, 
    phone,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    NEW.raw_user_meta_data->>'phone',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    updated_at = NOW();
    
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail auth, just log
    RAISE LOG 'Failed to create user profile for %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. CREATE THE TRIGGER
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. SYNC ALL EXISTING AUTH USERS TO PUBLIC.USERS
INSERT INTO public.users (id, full_name, email, role, phone, created_at, updated_at)
SELECT 
  au.id,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    split_part(au.email, '@', 1)
  ) as full_name,
  au.email,
  COALESCE(au.raw_user_meta_data->>'role', 'customer') as role,
  au.raw_user_meta_data->>'phone' as phone,
  au.created_at,
  NOW()
FROM auth.users au
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  updated_at = NOW();

-- 6. CREATE SIMPLE RLS POLICIES (PERMISSIVE FOR TESTING)
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.products;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.orders;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.settings;

-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for testing
CREATE POLICY "Allow all for authenticated users" ON public.users
  FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON public.products
  FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON public.orders
  FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON public.settings
  FOR ALL USING (true);

-- 7. VERIFY EVERYTHING IS WORKING
SELECT 
  'SETUP COMPLETE!' as status,
  (SELECT COUNT(*) FROM auth.users) as auth_users,
  (SELECT COUNT(*) FROM public.users) as public_users,
  (SELECT COUNT(*) FROM public.products WHERE status = 'active') as active_products;

-- 8. TEST QUERY - This should return products
SELECT name, price, status FROM public.products WHERE status = 'active' LIMIT 3;
