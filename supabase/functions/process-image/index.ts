
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

    // If it's a status check request
    if (originalImage.predictionId) {
      console.log("Checking status for prediction:", originalImage.predictionId)
      const prediction = await replicate.predictions.get(originalImage.predictionId)
      console.log("Status check response:", prediction)
      return new Response(JSON.stringify(prediction), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log("Processing image with prompt:", prompt)
    const prediction = await replicate.predictions.create({
      version: "e8a51197f37c41e7c0548fb30f78ab6a481aad99b4cae4f740f57c5d55ffbc96",
      input: {
        prompt: prompt,
        image: originalImage,
        mask: maskImage,
        enable_prompt_sampling: true,
        num_outputs: 1,
        seed: Math.floor(Math.random() * 1000000),
        steps: 50,
        guidance: 7.5,
        safety_tolerance: 1,
        output_format: "png"
      }
    })

    // Wait for the prediction to complete
    let finalPrediction = prediction
    while (finalPrediction.status !== "succeeded" && finalPrediction.status !== "failed") {
      console.log("Waiting for prediction to complete. Current status:", finalPrediction.status)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second before checking again
      finalPrediction = await replicate.predictions.get(prediction.id)
    }

    if (finalPrediction.status === "failed") {
      throw new Error("Prediction failed: " + finalPrediction.error)
    }

    console.log("Generation complete. Output:", finalPrediction.output)
    return new Response(JSON.stringify({ output: finalPrediction.output[0] }), {
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
