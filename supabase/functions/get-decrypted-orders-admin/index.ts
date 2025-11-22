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
    console.log('Edge function called - checking authorization')
    
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    console.log('Auth header present:', !!authHeader)
    
    if (!authHeader) {
      console.error('No authorization header')
      return new Response(
        JSON.stringify({ error: 'Unauthorized - No auth header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Create admin client to verify JWT and check role
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Verifying JWT token')
    
    // Verify the JWT token using the admin client
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await adminClient.auth.getUser(token)
    
    console.log('Auth check result - User ID:', user?.id, 'Error:', authError?.message)
    
    if (authError || !user) {
      console.error('Auth verification failed:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    console.log('User authenticated, checking admin role for user:', user.id)

    // Check if user has admin role
    const { data: roleData, error: roleError } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle()

    console.log('Role check result:', roleData, 'Error:', roleError?.message)

    if (roleError || !roleData) {
      console.error('User is not an admin:', user.id, roleError)
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // Get the ENCRYPTION_KEY from secrets
    const encryptionKey = Deno.env.get('ENCRYPTION_KEY')
    
    if (!encryptionKey) {
      console.error('ENCRYPTION_KEY not found in environment')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('Fetching all orders for admin user:', user.id)
    
    // Fetch all orders from the database
    const { data: orders, error: ordersError } = await adminClient
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (ordersError) {
      console.error('Error fetching orders:', ordersError)
      return new Response(
        JSON.stringify({ error: ordersError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log(`Fetched ${orders?.length || 0} orders, decrypting...`)

    // Decrypt each order
    const decryptedOrders = []
    
    for (const order of orders || []) {
      try {
        // Use the existing RPC function to decrypt this order
        // We'll create a temporary admin context by using the service role
        const { data: decrypted, error: decryptError } = await adminClient
          .rpc('decrypt_single_order', {
            p_encryption_key: encryptionKey,
            p_order_id: order.id
          })
        
        if (decryptError) {
          console.error('Error decrypting order:', order.id, decryptError)
          continue
        }
        
        if (decrypted && decrypted.length > 0) {
          decryptedOrders.push(decrypted[0])
        }
      } catch (err) {
        console.error('Exception decrypting order:', order.id, err)
        continue
      }
    }

    console.log(`Successfully decrypted ${decryptedOrders.length} orders`)

    return new Response(
      JSON.stringify({ data: decryptedOrders }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
