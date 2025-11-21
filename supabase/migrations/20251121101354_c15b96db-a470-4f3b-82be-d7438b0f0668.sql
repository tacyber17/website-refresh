-- Recreate the encrypt_order_data function referencing pgcrypto from extensions schema
DROP FUNCTION IF EXISTS public.encrypt_order_data(text, jsonb, text, jsonb);

CREATE OR REPLACE FUNCTION public.encrypt_order_data(
  p_encryption_key TEXT,
  p_items JSONB,
  p_payment_method TEXT,
  p_shipping_address JSONB
)
RETURNS TABLE(
  encrypted_items TEXT,
  encrypted_payment TEXT,
  encrypted_shipping TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'extensions'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    encode(extensions.pgp_sym_encrypt(p_items::text, p_encryption_key), 'base64')::text as encrypted_items,
    encode(extensions.pgp_sym_encrypt(p_payment_method, p_encryption_key), 'base64')::text as encrypted_payment,
    encode(extensions.pgp_sym_encrypt(p_shipping_address::text, p_encryption_key), 'base64')::text as encrypted_shipping;
END;
$$;