
import { supabase } from "@/integrations/supabase/client";

export const uploadToSupabase = async (base64Data: string, filename: string): Promise<string> => {
  try {
    const base64Response = await fetch(base64Data);
    const blob = await base64Response.blob();
    const filePath = `${crypto.randomUUID()}-${filename}`;
    
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, blob, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    const { data } = await supabase.storage
      .from('images')
      .createSignedUrl(filePath, 3600);

    if (!data?.signedUrl) {
      throw new Error('Could not get signed URL for uploaded image');
    }

    console.log('Successfully uploaded image, signed URL:', data.signedUrl);
    return data.signedUrl;
  } catch (error) {
    console.error('Error in uploadToSupabase:', error);
    throw error;
  }
};

export const createBinaryMask = async (canvas: HTMLCanvasElement): Promise<string> => {
  try {
    // Convert canvas to base64 data URL
    const imageDataUrl = canvas.toDataURL('image/png');
    
    // Upload original image to Supabase
    const imageUrl = await uploadToSupabase(imageDataUrl, 'original.png');

    // Call the process-image function with the Replicate model
    const { data, error } = await supabase.functions.invoke('process-image', {
      body: {
        originalImage: imageUrl,
        prompt: "Generate a binary mask that segments clothing from the image, excluding face and background. The mask should be white (255,255,255) for clothing and black (0,0,0) for everything else.",
      }
    });

    if (error) {
      throw error;
    }

    // Get the output URL from the Replicate API response
    if (!data.output) {
      throw new Error('No output received from the image processing');
    }

    // Fetch the generated mask
    const response = await fetch(data.output);
    const blob = await response.blob();
    
    // Convert blob to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error in createBinaryMask:', error);
    throw error;
  }
};
