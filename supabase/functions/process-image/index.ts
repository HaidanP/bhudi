
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

    const { originalImage, maskImage, prompt } = await req.json()

    if (!originalImage || !maskImage || !prompt) {
      console.error('Missing required parameters:', { originalImage, maskImage, prompt })
      throw new Error('Missing required parameters')
    }

    // If it's a status check request
    if (originalImage.predictionId) {
      console.log("Checking status for prediction:", originalImage.predictionId)
      const prediction = await replicate.predictions.get(originalImage.predictionId)
      console.log("Status check response:", prediction)
      return new Response(JSON.stringify(prediction), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    console.log("Processing image with prompt:", prompt)
    console.log("Original image URL:", originalImage)
    console.log("Mask image URL:", maskImage)

    let prediction
    try {
      prediction = await replicate.run(
        "black-forest-labs/flux-fill-pro",
        {
          input: {
            prompt: prompt,
            image: originalImage,
            mask: maskImage,
            seed: 0,
            steps: 50,
            prompt_upsampling: true,
            guidance: 60,
            safety_tolerance: 2,
            output_format: "jpg"
          }
        }
      )
      console.log("Raw prediction response:", prediction)
    } catch (error) {
      console.error("Replicate API error details:", {
        error,
        message: error.message,
        stack: error.stack,
        response: error.response
      })
      return new Response(JSON.stringify({ 
        error: 'Failed to process image with Replicate API',
        details: error.message 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      })
    }

    if (!prediction) {
      console.error("No prediction output received")
      return new Response(JSON.stringify({ error: 'No prediction output received' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      })
    }

    console.log("Generation complete. Output:", prediction)
    return new Response(JSON.stringify({ output: prediction }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("Error in process-image function:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
