-- Create payments table for encrypted transaction storage
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL,
  user_id UUID NOT NULL,
  safepay_transaction_id TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'PKR',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  encrypted_details BYTEA,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "Users can view their own payments"
ON public.payments
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own payments
CREATE POLICY "Users can create their own payments"
ON public.payments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all payments
CREATE POLICY "Admins can view all payments"
ON public.payments
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to encrypt payment details
CREATE OR REPLACE FUNCTION public.encrypt_payment_details(
  p_payment_details JSONB,
  p_encryption_key TEXT
)
RETURNS BYTEA
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN pgp_sym_encrypt(p_payment_details::text, p_encryption_key);
END;
$$;

-- Create function to get decrypted payments
CREATE OR REPLACE FUNCTION public.get_decrypted_payments(p_encryption_key TEXT)
RETURNS TABLE(
  id UUID,
  order_id UUID,
  user_id UUID,
  safepay_transaction_id TEXT,
  amount NUMERIC,
  currency TEXT,
  status TEXT,
  payment_method TEXT,
  payment_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.order_id,
    p.user_id,
    p.safepay_transaction_id,
    p.amount,
    p.currency,
    p.status,
    p.payment_method,
    CASE 
      WHEN p.encrypted_details IS NOT NULL THEN
        pgp_sym_decrypt(p.encrypted_details, p_encryption_key)::jsonb
      ELSE NULL
    END as payment_details,
    p.created_at,
    p.updated_at
  FROM public.payments p
  WHERE p.user_id = auth.uid();
END;
$$;