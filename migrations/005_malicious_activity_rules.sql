-- Flag multiple failures by the same delivery partner within a rolling window
CREATE OR REPLACE FUNCTION public.flag_multiple_failures()
RETURNS TRIGGER AS $$
DECLARE
  failure_count INTEGER;
BEGIN
  -- Only consider transitions to cancelled after out_for_delivery without user confirmation
  IF NEW.status = 'cancelled' AND COALESCE(NEW.user_confirmed_delivery, false) = FALSE THEN
    SELECT COUNT(*) INTO failure_count
    FROM public.orders o
    WHERE o.delivery_partner_id = NEW.delivery_partner_id
      AND o.status = 'cancelled'
      AND o.updated_at >= (NOW() - INTERVAL '24 hours');

    IF failure_count >= 3 THEN
      INSERT INTO public.malicious_activities (
        delivery_partner_id,
        user_id,
        order_id,
        activity_type,
        description,
        severity,
        status
      ) VALUES (
        NEW.delivery_partner_id,
        NEW.user_id,
        NEW.id,
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


