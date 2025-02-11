
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import Replicate from "https://esm.sh/replicate@0.25.2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY')
    if (!REPLICATE_API_KEY) {
      throw new Error('REPLICATE_API_KEY is not set')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const replicate = new Replicate({
      auth: REPLICATE_API_KEY,
    })

    const { imageUrl } = await req.json()

    if (!imageUrl) {
      throw new Error('Image URL is required')
    }

    console.log("Generating mask for image:", imageUrl)

    // Run the model and wait for completion - using a model that detects all clothing including footwear
    const output = await replicate.run(
      "cjwbw/mask-clothing-all:e121a56720ff7f4cec25660992bb8c0800c08f89c7876ffe560c86c1f28166b7",
      {
        input: {
          image: imageUrl
        }
      }
    )

    console.log("Mask generation complete. Output:", output)
    return new Response(JSON.stringify({ output }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("Error in mask-clothing function:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
