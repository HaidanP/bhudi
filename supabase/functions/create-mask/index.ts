
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import Replicate from "https://esm.sh/replicate@0.25.2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY')
    if (!REPLICATE_API_KEY) {
      throw new Error('REPLICATE_API_KEY is not set')
    }

    const replicate = new Replicate({
      auth: REPLICATE_API_KEY,
    });

    const { image, text_prompt } = await req.json()

    console.log("Creating clothing mask with CLIPSeg")
    console.log("Input image:", image)
    console.log("Text prompt:", text_prompt)

    const prediction = await replicate.run(
      "fofr/clipseg:28b5242dabd55750fea673cd99f5f93f05726cc69cdb3a4a41b80ee933dcf0e2",
      {
        input: {
          image: image,
          text: text_prompt,
          threshold: 0.5,
          return_binary_mask: true
        }
      }
    );

    console.log("Mask generation complete. Output:", prediction)
    return new Response(
      JSON.stringify({ maskUrl: prediction }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error("Error in create-mask function:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
