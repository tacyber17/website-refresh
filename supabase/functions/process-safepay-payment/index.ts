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

    const paymentData: PaymentRequest = await req.json();
    console.log('Processing payment for order:', paymentData.orderId);

    // Safepay API endpoint
    const safepayBaseUrl = safepayEnv === 'production' 
      ? 'https://api.getsafepay.com'
      : 'https://sandbox.api.getsafepay.com';

    // Create Safepay payment session using correct API
    const sessionResponse = await fetch(`${safepayBaseUrl}/payments/v1/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${safepayApiKey}`,
      },
      body: JSON.stringify({
        merchant_api_key: safepayApiKey,
        intent: "CYBERSOURCE",
        mode: "payment",
        currency: paymentData.currency,
        amount: Math.round(paymentData.amount * 100), // Convert to paisa/cents
        metadata: {
          order_id: paymentData.orderId,
          customer_email: paymentData.customerEmail,
          customer_name: paymentData.customerName,
        },
      }),
    });

    const responseText = await sessionResponse.text();
    console.log('Safepay session response status:', sessionResponse.status);
    console.log('Safepay session response:', responseText);

    if (!sessionResponse.ok) {
      console.error('Safepay API error - Status:', sessionResponse.status);
      console.error('Safepay API error - Body:', responseText);
      
      let errorMessage = `Safepay API returned status ${sessionResponse.status}`;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || responseText;
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
      throw new Error(`Invalid JSON response from Safepay: ${responseText}`);
    }

    console.log('Safepay session created:', sessionData);

    // Get the tracker token from the session
    const trackerToken = sessionData.data?.token;

    if (!trackerToken) {
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

    // Return the tracker token and redirect URL
    // For Safepay, you'll need to redirect to their checkout page with this token
    const checkoutUrl = `${safepayBaseUrl}/checkout?tracker=${trackerToken}`;

    return new Response(
      JSON.stringify({
        success: true,
        checkout_url: checkoutUrl,
        token: trackerToken,
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