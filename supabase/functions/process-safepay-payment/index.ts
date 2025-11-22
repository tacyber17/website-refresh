import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  shippingAddress: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const safepayApiKey = Deno.env.get('SAFEPAY_API_KEY')!;
    const safepayEnv = Deno.env.get('SAFEPAY_ENVIRONMENT') || 'sandbox';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check rate limit: 5 payment attempts per 5 minutes
    const { data: rateLimitData } = await supabase.rpc('check_rate_limit', {
      p_identifier: user.id,
      p_endpoint: 'process-safepay-payment',
      p_max_attempts: 5,
      p_window_minutes: 5,
      p_block_minutes: 15
    });

    if (rateLimitData && !rateLimitData.allowed) {
      console.log('Rate limit exceeded for user:', user.id);
      return new Response(
        JSON.stringify({ 
          error: 'Too many payment attempts. Please try again later.',
          blocked_until: rateLimitData.blocked_until
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429,
        }
      );
    }

    const paymentData: PaymentRequest = await req.json();
    console.log('Processing payment for order:', paymentData.orderId);

    // Safepay API endpoint
    const safepayBaseUrl = safepayEnv === 'production' 
      ? 'https://api.getsafepay.com'
      : 'https://sandbox.api.getsafepay.com';

    // Create Safepay payment tracker using correct API v3
    const sessionResponse = await fetch(`${safepayBaseUrl}/order/payments/v3/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        merchant_api_key: safepayApiKey,
        intent: "CYBERSOURCE",
        mode: "payment",
        entry_mode: "raw",
        currency: paymentData.currency,
        amount: Math.round(paymentData.amount * 100), // Convert to paisa/cents
        metadata: {
          order_id: paymentData.orderId,
        },
      }),
    });

    const responseText = await sessionResponse.text();
    console.log('Safepay tracker response status:', sessionResponse.status);
    console.log('Safepay tracker response:', responseText);

    if (!sessionResponse.ok) {
      console.error('Safepay API error - Status:', sessionResponse.status);
      console.error('Safepay API error - Body:', responseText);
      
      let errorMessage = `Safepay API returned status ${sessionResponse.status}`;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || errorData.detail || responseText;
      } catch (e) {
        errorMessage = responseText || errorMessage;
      }
      
      throw new Error(`Safepay API error: ${errorMessage}`);
    }

    let sessionData;
    try {
      sessionData = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse Safepay response:', responseText);
      throw new Error(`Invalid JSON response from Safepay: ${responseText.substring(0, 200)}`);
    }

    console.log('Safepay tracker created:', sessionData);

    // Get the tracker token from the response
    // The v3 API returns the token directly in the data object
    const trackerToken = sessionData.data?.token || sessionData.token || sessionData.data?.tracker;

    if (!trackerToken) {
      console.error('No token found in Safepay response. Full response:', JSON.stringify(sessionData));
      throw new Error('No tracker token received from Safepay');
    }

    // Store payment record with tracker token
    const { error: insertError } = await supabase
      .from('payments')
      .insert({
        order_id: paymentData.orderId,
        user_id: user.id,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: 'pending',
        payment_method: 'safepay',
        safepay_transaction_id: trackerToken,
      });

    if (insertError) {
      console.error('Error storing payment:', insertError);
      throw insertError;
    }

    // Return the tracker token for frontend SDK usage
    // The frontend will use Safepay SDK to complete the payment
    return new Response(
      JSON.stringify({
        success: true,
        token: trackerToken,
        environment: safepayEnv,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Payment processing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});