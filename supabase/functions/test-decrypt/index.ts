import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get the ENCRYPTION_KEY from secrets
    const encryptionKey = Deno.env.get('ENCRYPTION_KEY')
    
    console.log('Testing decryption with ENCRYPTION_KEY secret')
    
    // Try to decrypt one order
    const { data, error } = await supabaseClient.rpc('admin_get_all_decrypted_orders', {
      p_encryption_key: encryptionKey
    })

    if (error) {
      console.error('Decryption error:', error)
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log(`Successfully decrypted ${data?.length || 0} orders`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        orderCount: data?.length || 0,
        firstOrder: data?.[0] || null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
