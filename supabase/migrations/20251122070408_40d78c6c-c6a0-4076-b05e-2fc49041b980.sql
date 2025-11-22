-- Update the admin_get_all_decrypted_orders function to use the extensions schema
CREATE OR REPLACE FUNCTION public.admin_get_all_decrypted_orders(p_encryption_key text)
 RETURNS TABLE(id uuid, user_id uuid, shipping_address jsonb, payment_method text, items jsonb, total numeric, status text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
BEGIN
  -- Only admins can access this
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized access';
  END IF;

  RETURN QUERY
  SELECT 
    o.id,
    o.user_id,
    extensions.pgp_sym_decrypt(o.shipping_address, p_encryption_key)::jsonb as shipping_address,
    extensions.pgp_sym_decrypt(o.payment_method, p_encryption_key)::text as payment_method,
    extensions.pgp_sym_decrypt(o.items, p_encryption_key)::jsonb as items,
    o.total,
    o.status,
    o.created_at,
    o.updated_at
  FROM public.orders o;
END;
$function$;

-- Also update get_decrypted_orders for regular users
CREATE OR REPLACE FUNCTION public.get_decrypted_orders(p_encryption_key text)
 RETURNS TABLE(id uuid, user_id uuid, shipping_address jsonb, payment_method text, items jsonb, total numeric, status text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.user_id,
    extensions.pgp_sym_decrypt(o.shipping_address, p_encryption_key)::jsonb as shipping_address,
    extensions.pgp_sym_decrypt(o.payment_method, p_encryption_key)::text as payment_method,
    extensions.pgp_sym_decrypt(o.items, p_encryption_key)::jsonb as items,
    o.total,
    o.status,
    o.created_at,
    o.updated_at
  FROM public.orders o
  WHERE o.user_id = auth.uid();
END;
$function$;