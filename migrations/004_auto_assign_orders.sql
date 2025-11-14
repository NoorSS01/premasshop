-- Add helper column for assignment tracking
ALTER TABLE public.delivery_partners
  ADD COLUMN IF NOT EXISTS last_assigned_at TIMESTAMPTZ;

-- Function: auto-assign a delivery partner to new orders
CREATE OR REPLACE FUNCTION public.auto_assign_order()
RETURNS TRIGGER AS $$
DECLARE
  auto_assign_enabled BOOLEAN := true;
  chosen_partner RECORD;
BEGIN
  -- Read auto-assign flag from settings if present
  SELECT (value::text)::boolean INTO auto_assign_enabled
  FROM public.settings
  WHERE key = 'auto_assign_orders'
  LIMIT 1;

  IF auto_assign_enabled IS DISTINCT FROM TRUE THEN
    RETURN NEW;
  END IF;

  -- Only auto-assign pending orders without a delivery partner
  IF NEW.status = 'pending' AND NEW.delivery_partner_id IS NULL THEN
    -- Pick an approved/allowed partner with least recent assignment
    SELECT dp.*
    INTO chosen_partner
    FROM public.delivery_partners dp
    WHERE dp.allowed = TRUE
      AND dp.status = 'approved'
    ORDER BY COALESCE(dp.last_assigned_at, to_timestamp(0)) ASC
    LIMIT 1;

    IF chosen_partner.id IS NOT NULL THEN
      NEW.delivery_partner_id := chosen_partner.id;
      NEW.status := 'assigned';

      -- Update partner last_assigned_at
      UPDATE public.delivery_partners
      SET last_assigned_at = NOW()
      WHERE id = chosen_partner.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: run auto-assign on insert into orders
DROP TRIGGER IF EXISTS trg_auto_assign_order ON public.orders;
CREATE TRIGGER trg_auto_assign_order
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.auto_assign_order();


