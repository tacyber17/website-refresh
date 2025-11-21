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
    const encryptionKey = Deno.env.get('ENCRYPTION_KEY')!;

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

    // Create Safepay checkout session
    const safepayResponse = await fetch(`${safepayBaseUrl}/checkout/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-SFPY-API-KEY': safepayApiKey,
      },
      body: JSON.stringify({
        amount: Math.round(paymentData.amount * 100), // Convert to paisa
        currency: paymentData.currency,
        order_id: paymentData.orderId,
        source: 'web',
        webhook_url: `${supabaseUrl}/functions/v1/safepay-webhook`,
        redirect_url: `${Deno.env.get('VITE_SUPABASE_URL')}/order-confirmation`,
        cancel_url: `${Deno.env.get('VITE_SUPABASE_URL')}/checkout`,
        metadata: {
          customer_email: paymentData.customerEmail,
          customer_name: paymentData.customerName,
        },
      }),
    });

    const responseText = await safepayResponse.text();
    console.log('Safepay response status:', safepayResponse.status);
    console.log('Safepay response:', responseText);

    if (!safepayResponse.ok) {
      console.error('Safepay API error - Status:', safepayResponse.status);
      console.error('Safepay API error - Body:', responseText);
      
      let errorMessage = `Safepay API returned status ${safepayResponse.status}`;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || responseText;
      } catch (e) {
        errorMessage = responseText || errorMessage;
      }
      
      throw new Error(`Safepay API error: ${errorMessage}`);
    }

    let safepayData;
    try {
      safepayData = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse Safepay response:', responseText);
      throw new Error(`Invalid JSON response from Safepay: ${responseText}`);
    }

    console.log('Safepay checkout created:', safepayData.data?.token);

    // Encrypt payment details
    const paymentDetails = {
      safepay_token: safepayData.data?.token,
      customer_email: paymentData.customerEmail,
      customer_name: paymentData.customerName,
      shipping_address: paymentData.shippingAddress,
    };

    const { data: encryptedDetails } = await supabase.rpc('encrypt_payment_details', {
      p_payment_details: paymentDetails,
      p_encryption_key: encryptionKey,
    });

    // Store payment record
    const { error: insertError } = await supabase
      .from('payments')
      .insert({
        order_id: paymentData.orderId,
        user_id: user.id,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: 'pending',
        payment_method: 'safepay',
        encrypted_details: encryptedDetails,
      });

    if (insertError) {
      console.error('Error storing payment:', insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        checkout_url: safepayData.data?.url,
        token: safepayData.data?.token,
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