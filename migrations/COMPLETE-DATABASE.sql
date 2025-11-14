-- COMPLETE-DATABASE.sql
-- One-shot Supabase SQL to create/upgrade the schema required by the app.
-- Idempotent: uses IF NOT EXISTS and CREATE OR REPLACE where possible.
-- Paste this entire file into Supabase SQL Editor and run once.

-- 0) Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1) Core Tables
-- 1.1 users (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'delivery')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 products
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  cost_price DECIMAL(10, 2) NOT NULL CHECK (cost_price >= 0),
  images TEXT[] DEFAULT '{}',
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'coming_soon')),
  -- Added fields
  category TEXT,
  sku TEXT,
  weight NUMERIC,
  unit TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 delivery_partners
CREATE TABLE IF NOT EXISTS public.delivery_partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paused', 'deleted')),
  allowed BOOLEAN DEFAULT FALSE,
  vehicle_info TEXT,
  last_assigned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id)
);

-- 1.4 orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL, -- [{product_id, name, qty, price}]
  total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('COD', 'UPI')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  delivery_partner_id UUID REFERENCES public.delivery_partners(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'out_for_delivery', 'delivered', 'cancelled')),
  address JSONB NOT NULL, -- {apartment, block_no, flat_no, phone, note}
  delivery_cost DECIMAL(10, 2) DEFAULT 0,
  commission_percent DECIMAL(5, 2) DEFAULT 0,
  user_confirmed_delivery BOOLEAN DEFAULT FALSE,
  delivery_confirmation_requested_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.5 order_items (normalized items)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  product_name TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.6 payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider TEXT DEFAULT 'payu',
  provider_payment_id TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
  raw_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.7 settings
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.8 malicious_activities
CREATE TABLE IF NOT EXISTS public.malicious_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_partner_id UUID REFERENCES public.delivery_partners(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('failed_delivery','rejected_confirmation','multiple_failures','suspicious_behavior')),
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'low' CHECK (severity IN ('low','medium','high','critical')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewed','resolved','dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  resolution_notes TEXT
);

-- 2) Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_partner_id ON public.orders(delivery_partner_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_delivery_partners_user_id ON public.delivery_partners(user_id);
CREATE INDEX IF NOT EXISTS idx_delivery_partners_status ON public.delivery_partners(status);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_payment_id ON public.payments(provider_payment_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- 3) Timestamps trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
    CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_products_updated_at') THEN
    CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_delivery_partners_updated_at') THEN
    CREATE TRIGGER update_delivery_partners_updated_at BEFORE UPDATE ON public.delivery_partners
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_orders_updated_at') THEN
    CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_settings_updated_at') THEN
    CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- 4) RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.malicious_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Users: self read/update; admin read all
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND policyname='Users can view own profile') THEN
    CREATE POLICY "Users can view own profile" ON public.users
      FOR SELECT USING (auth.uid() = id OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND policyname='Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON public.users
      FOR UPDATE USING (auth.uid() = id);
  END IF;
END$$;

-- Products: public read; admin manage
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='products' AND policyname='Products are viewable by everyone') THEN
    CREATE POLICY "Products are viewable by everyone" ON public.products
      FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='products' AND policyname='Only admins can manage products') THEN
    CREATE POLICY "Only admins can manage products" ON public.products
      FOR ALL USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
  END IF;
END$$;

-- Orders: user self, assigned delivery partner, or admin
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='orders' AND policyname='Users can view own orders') THEN
    CREATE POLICY "Users can view own orders" ON public.orders
      FOR SELECT USING (
        auth.uid() = user_id OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' OR
        (delivery_partner_id IN (SELECT id FROM public.delivery_partners WHERE user_id = auth.uid() AND allowed = TRUE))
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='orders' AND policyname='Users can create own orders') THEN
    CREATE POLICY "Users can create own orders" ON public.orders
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='orders' AND policyname='Admins and delivery partners can update orders') THEN
    CREATE POLICY "Admins and delivery partners can update orders" ON public.orders
      FOR UPDATE USING (
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' OR
        (delivery_partner_id IN (SELECT id FROM public.delivery_partners WHERE user_id = auth.uid() AND allowed = TRUE))
      );
  END IF;
END$$;

-- Delivery partners: self view; admin manage
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='delivery_partners' AND policyname='Users can view own delivery partner record') THEN
    CREATE POLICY "Users can view own delivery partner record" ON public.delivery_partners
      FOR SELECT USING (auth.uid() = user_id OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='delivery_partners' AND policyname='Only admins can manage delivery partners') THEN
    CREATE POLICY "Only admins can manage delivery partners" ON public.delivery_partners
      FOR ALL USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
  END IF;
END$$;

-- Payments: user for own orders; admin all
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='payments' AND policyname='Users can view payments for own orders') THEN
    CREATE POLICY "Users can view payments for own orders" ON public.payments
      FOR SELECT USING (
        order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
      );
  END IF;
END$$;

-- Settings: only admin
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='settings' AND policyname='Only admins can manage settings') THEN
    CREATE POLICY "Only admins can manage settings" ON public.settings
      FOR ALL USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
  END IF;
END$$;

-- Malicious activities: admin read/write
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='malicious_activities' AND policyname='Admins can read malicious activities') THEN
    CREATE POLICY "Admins can read malicious activities" ON public.malicious_activities
      FOR SELECT USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='malicious_activities' AND policyname='Admins can write malicious activities') THEN
    CREATE POLICY "Admins can write malicious activities" ON public.malicious_activities
      FOR ALL USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
  END IF;
END$$;

-- Order items: same visibility as parent order (simplified: visible to owner/admin/delivery)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='order_items' AND policyname='Order items are visible with order access') THEN
    CREATE POLICY "Order items are visible with order access" ON public.order_items
      FOR SELECT USING (
        order_id IN (
          SELECT id FROM public.orders WHERE
            user_id = auth.uid() OR
            (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' OR
            (delivery_partner_id IN (SELECT id FROM public.delivery_partners WHERE user_id = auth.uid() AND allowed = TRUE))
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='order_items' AND policyname='Order items can be inserted by order owner or admin') THEN
    CREATE POLICY "Order items can be inserted by order owner or admin" ON public.order_items
      FOR INSERT WITH CHECK (
        order_id IN (
          SELECT id FROM public.orders WHERE
            user_id = auth.uid() OR
            (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
        )
      );
  END IF;
END$$;

-- 5) Auto-assign trigger for orders
CREATE OR REPLACE FUNCTION public.auto_assign_order()
RETURNS TRIGGER AS $$
DECLARE
  auto_assign_enabled BOOLEAN := TRUE;
  chosen_partner RECORD;
BEGIN
  SELECT (value::text)::boolean INTO auto_assign_enabled
  FROM public.settings WHERE key = 'auto_assign_orders' LIMIT 1;
  IF auto_assign_enabled IS DISTINCT FROM TRUE THEN
    RETURN NEW;
  END IF;

  IF NEW.status = 'pending' AND NEW.delivery_partner_id IS NULL THEN
    SELECT dp.* INTO chosen_partner
    FROM public.delivery_partners dp
    WHERE dp.allowed = TRUE AND dp.status = 'approved'
    ORDER BY COALESCE(dp.last_assigned_at, to_timestamp(0)) ASC
    LIMIT 1;
    IF chosen_partner.id IS NOT NULL THEN
      NEW.delivery_partner_id := chosen_partner.id;
      NEW.status := 'assigned';
      UPDATE public.delivery_partners SET last_assigned_at = NOW() WHERE id = chosen_partner.id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_auto_assign_order ON public.orders;
CREATE TRIGGER trg_auto_assign_order
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.auto_assign_order();

-- 6) Malicious activity rule: multiple failures in 24h
CREATE OR REPLACE FUNCTION public.flag_multiple_failures()
RETURNS TRIGGER AS $$
DECLARE
  failure_count INTEGER;
BEGIN
  IF NEW.status = 'cancelled' AND COALESCE(NEW.user_confirmed_delivery, FALSE) = FALSE THEN
    SELECT COUNT(*) INTO failure_count
    FROM public.orders o
    WHERE o.delivery_partner_id = NEW.delivery_partner_id
      AND o.status = 'cancelled'
      AND o.updated_at >= (NOW() - INTERVAL '24 hours');
    IF failure_count >= 3 THEN
      INSERT INTO public.malicious_activities (
        delivery_partner_id, user_id, order_id, activity_type, description, severity, status
      ) VALUES (
        NEW.delivery_partner_id, NEW.user_id, NEW.id,
        'multiple_failures',
        'Delivery partner has multiple failed deliveries within 24 hours',
        'high',
        'pending'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_flag_multiple_failures ON public.orders;
CREATE TRIGGER trg_flag_multiple_failures
AFTER UPDATE ON public.orders
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.flag_multiple_failures();

-- 7) Seed data (safe to re-run)
INSERT INTO public.settings (key, value) VALUES
  ('auto_assign_orders', 'true'::jsonb),
  ('default_delivery_cost', '20.00'::jsonb),
  ('default_commission_percent', '5.00'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Sample products
INSERT INTO public.products (name, description, price, cost_price, images, stock, status, category)
VALUES
  ('Fresh Vegetables Bundle', 'A mix of fresh seasonal vegetables delivered to your doorstep', 299.00, 200.00, ARRAY['/images/products/vegetables.jpg'], 50, 'active', 'fruits_vegetables'),
  ('Premium Fruits Pack', 'Assorted fresh fruits, handpicked for quality', 499.00, 350.00, ARRAY['/images/products/fruits.jpg'], 30, 'active', 'fruits_vegetables'),
  ('Daily Essentials Kit', 'All your daily essentials in one convenient pack', 599.00, 450.00, ARRAY['/images/products/essentials.jpg'], 25, 'active', 'groceries')
ON CONFLICT DO NOTHING;


