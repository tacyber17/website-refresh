-- Create rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- IP address or user ID
  endpoint TEXT NOT NULL, -- endpoint being rate limited
  attempt_count INTEGER DEFAULT 1,
  first_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_rate_limits_identifier_endpoint ON public.rate_limits(identifier, endpoint);
CREATE INDEX idx_rate_limits_blocked_until ON public.rate_limits(blocked_until);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only allow service role to manage rate limits (edge functions)
CREATE POLICY "Service role can manage rate limits"
  ON public.rate_limits
  FOR ALL
  USING (auth.role() = 'service_role');

-- Function to check and update rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_endpoint TEXT,
  p_max_attempts INTEGER,
  p_window_minutes INTEGER,
  p_block_minutes INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record RECORD;
  v_result JSONB;
BEGIN
  -- Clean up old records
  DELETE FROM public.rate_limits
  WHERE last_attempt_at < NOW() - INTERVAL '1 hour';

  -- Get or create rate limit record
  SELECT * INTO v_record
  FROM public.rate_limits
  WHERE identifier = p_identifier
    AND endpoint = p_endpoint
  FOR UPDATE;

  -- Check if currently blocked
  IF v_record.blocked_until IS NOT NULL AND v_record.blocked_until > NOW() THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'blocked_until', v_record.blocked_until,
      'reason', 'Rate limit exceeded'
    );
  END IF;

  -- Check if window has expired
  IF v_record.last_attempt_at IS NULL OR 
     v_record.last_attempt_at < NOW() - (p_window_minutes || ' minutes')::INTERVAL THEN
    -- Reset counter
    UPDATE public.rate_limits
    SET attempt_count = 1,
        first_attempt_at = NOW(),
        last_attempt_at = NOW(),
        blocked_until = NULL
    WHERE identifier = p_identifier AND endpoint = p_endpoint;
    
    RETURN jsonb_build_object('allowed', true, 'attempts_remaining', p_max_attempts - 1);
  END IF;

  -- Increment counter
  IF v_record.attempt_count >= p_max_attempts THEN
    -- Block user
    UPDATE public.rate_limits
    SET blocked_until = NOW() + (p_block_minutes || ' minutes')::INTERVAL,
        last_attempt_at = NOW()
    WHERE identifier = p_identifier AND endpoint = p_endpoint;
    
    RETURN jsonb_build_object(
      'allowed', false,
      'blocked_until', NOW() + (p_block_minutes || ' minutes')::INTERVAL,
      'reason', 'Rate limit exceeded'
    );
  ELSE
    -- Increment attempt count
    UPDATE public.rate_limits
    SET attempt_count = attempt_count + 1,
        last_attempt_at = NOW()
    WHERE identifier = p_identifier AND endpoint = p_endpoint;
    
    RETURN jsonb_build_object(
      'allowed', true,
      'attempts_remaining', p_max_attempts - v_record.attempt_count - 1
    );
  END IF;

  -- If no record exists, create one
  IF v_record IS NULL THEN
    INSERT INTO public.rate_limits (identifier, endpoint, attempt_count, first_attempt_at, last_attempt_at)
    VALUES (p_identifier, p_endpoint, 1, NOW(), NOW());
    
    RETURN jsonb_build_object('allowed', true, 'attempts_remaining', p_max_attempts - 1);
  END IF;
END;
$$;