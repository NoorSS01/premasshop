-- Seed initial settings
INSERT INTO public.settings (key, value) VALUES
    ('auto_assign_orders', 'true'::jsonb),
    ('default_delivery_cost', '20.00'::jsonb),
    ('default_commission_percent', '5.00'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Seed sample products
-- NOTE: Replace with actual product data and images
INSERT INTO public.products (name, description, price, cost_price, images, stock, status) VALUES
    (
        'Fresh Vegetables Bundle',
        'A mix of fresh seasonal vegetables delivered to your doorstep',
        299.00,
        200.00,
        ARRAY['/images/products/vegetables.jpg'],
        50,
        'active'
    ),
    (
        'Premium Fruits Pack',
        'Assorted fresh fruits, handpicked for quality',
        499.00,
        350.00,
        ARRAY['/images/products/fruits.jpg'],
        30,
        'active'
    ),
    (
        'Daily Essentials Kit',
        'All your daily essentials in one convenient pack',
        599.00,
        450.00,
        ARRAY['/images/products/essentials.jpg'],
        25,
        'active'
    )
ON CONFLICT DO NOTHING;

-- NOTE: Admin user will be created via Supabase Auth and then linked in users table
-- The admin email and password should be set in environment variables
-- After creating the user in Supabase Auth, run:
-- UPDATE public.users SET role = 'admin' WHERE email = 'YOUR_ADMIN_EMAIL';

