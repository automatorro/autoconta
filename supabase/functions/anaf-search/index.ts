const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    console.log('📦 Received body:', JSON.stringify(body))
    
    const cui = body.cui || body.CUI
    const dataCurenta = new Date().toISOString().split('T')[0]

    if (!cui) {
      throw new Error('CUI lipsește din request')
    }

    console.log('🔍 ANAF Edge Function - Searching CUI:', cui)

    const response = await fetch(
      'https://webservicesp.anaf.ro/PlatitorTvaRest/api/v8/ws/tva',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{
          cui: parseInt(cui),
          data: dataCurenta
        }])
      }
    )

    if (!response.ok) {
      throw new Error(`ANAF API returned ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ ANAF API Response:', data)

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('❌ ANAF Edge Function Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        cod: 500,
        message: 'Eroare la interogarea ANAF'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
