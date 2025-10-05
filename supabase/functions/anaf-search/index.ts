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
    const contentType = req.headers.get('content-type')
    console.log('📦 Content-Type:', contentType)
    
    const bodyText = await req.text()
    console.log('📦 Raw body received:', bodyText)
    
    let body
    try {
      body = JSON.parse(bodyText)
    } catch (e) {
      console.error('❌ JSON parse error:', e.message)
      throw new Error('Invalid JSON in request body')
    }
    
    console.log('📦 Parsed body:', JSON.stringify(body))
    
    const cui = body.cui || body.CUI
    
    if (!cui) {
      console.error('❌ CUI missing. Body keys:', Object.keys(body))
      throw new Error('CUI lipsește din request')
    }

    const dataCurenta = new Date().toISOString().split('T')[0]
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
