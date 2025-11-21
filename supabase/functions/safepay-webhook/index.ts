import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const webhookData = await req.json();
    console.log('Safepay webhook received:', webhookData);

    const { data: order_id, state, tracker } = webhookData.data || {};

    if (!order_id) {
      throw new Error('Missing order_id in webhook');
    }

    // Map Safepay states to our payment statuses
    let paymentStatus = 'pending';
    let orderStatus = 'pending';

    if (state === 'PAID') {
      paymentStatus = 'completed';
      orderStatus = 'confirmed';
    } else if (state === 'CANCELLED' || state === 'FAILED') {
      paymentStatus = 'failed';
      orderStatus = 'cancelled';
    }

    // Update payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        status: paymentStatus,
        safepay_transaction_id: tracker?.id || tracker?.token,
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', order_id);

    if (paymentError) {
      console.error('Error updating payment:', paymentError);
    }

    // Update order status
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        status: orderStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id);

    if (orderError) {
      console.error('Error updating order:', orderError);
    }

    console.log(`Order ${order_id} updated to ${orderStatus}`);

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Webhook processing error:', error);
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