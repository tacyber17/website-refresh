-- Create a helper function to decrypt a single order (bypasses auth.uid() check)
CREATE OR REPLACE FUNCTION public.decrypt_single_order(
  p_encryption_key text,
  p_order_id uuid
)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  shipping_address jsonb,
  payment_method text,
  items jsonb,
  total numeric,
  status text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
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
  WHERE o.id = p_order_id;
END;
$$;