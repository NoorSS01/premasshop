-- =====================================================
-- FIX PHONE NUMBERS FOR EXISTING USERS
-- Run this in Supabase SQL Editor to update phone numbers
-- =====================================================

-- First, let's see what users we have and their current phone status
SELECT 
  u.id,
  u.full_name,
  u.email,
  u.phone as current_phone,
  au.raw_user_meta_data->>'phone' as metadata_phone,
  au.raw_user_meta_data as full_metadata
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE u.phone IS NULL OR u.phone = '';

-- Update users who have phone in metadata but not in public.users table
UPDATE public.users 
SET phone = au.raw_user_meta_data->>'phone'
FROM auth.users au
WHERE public.users.id = au.id 
  AND (public.users.phone IS NULL OR public.users.phone = '')
  AND au.raw_user_meta_data->>'phone' IS NOT NULL
  AND au.raw_user_meta_data->>'phone' != '';

-- If you need to manually set phone numbers for specific users, use this template:
-- UPDATE public.users SET phone = '+1234567890' WHERE email = 'user@example.com';

-- Check the results after update
SELECT 
  u.id,
  u.full_name,
  u.email,
  u.phone as updated_phone
FROM public.users u
ORDER BY u.created_at DESC;

-- Also, let's add a trigger to automatically update phone when user metadata changes
CREATE OR REPLACE FUNCTION public.sync_user_phone()
RETURNS TRIGGER AS $$
BEGIN
  -- Update phone number in public.users when it changes in auth.users metadata
  UPDATE public.users 
  SET phone = NEW.raw_user_meta_data->>'phone',
      updated_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS sync_user_phone_trigger ON auth.users;

-- Create the trigger
CREATE TRIGGER sync_user_phone_trigger
AFTER UPDATE ON auth.users
FOR EACH ROW
WHEN (OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
EXECUTE FUNCTION public.sync_user_phone();

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT 'Phone numbers updated successfully!' as status;
