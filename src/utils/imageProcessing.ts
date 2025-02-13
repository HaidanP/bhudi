
import { supabase } from "@/integrations/supabase/client";

const MAX_IMAGE_DIMENSION = 512; // Limit image size to avoid memory issues

export const uploadToSupabase = async (base64Data: string, filename: string): Promise<string> => {
  try {
    const base64Response = await fetch(base64Data);
    const blob = await base64Response.blob();
    const filePath = `${crypto.randomUUID()}-${filename}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, blob, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    const { data: publicUrl } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    if (!publicUrl?.publicUrl) {
      throw new Error('Could not get public URL for uploaded image');
    }

    console.log('Successfully uploaded image, public URL:', publicUrl.publicUrl);
    return publicUrl.publicUrl;
  } catch (error) {
    console.error('Error in uploadToSupabase:', error);
    throw error;
  }
};

export const createBinaryMask = async (canvas: HTMLCanvasElement): Promise<string> => {
  try {
    console.log('Starting mask generation process...');
    
    // Upload the image to Supabase first
    const imageUrl = await uploadToSupabase(
      canvas.toDataURL(),
      'original.png'
    );

    // Call the Replicate model through our edge function
    const response = await supabase.functions.invoke('mask-clothing', {
      body: { imageUrl },
    });

    if (response.error) {
      throw new Error(`Error generating mask: ${response.error.message}`);
    }

    // The model returns an array of URLs, we want the first one (regular mask)
    const maskUrl = Array.isArray(response.data.output) ? response.data.output[0] : response.data.output;
    
    if (!maskUrl) {
      throw new Error('No mask URL returned from the model');
    }

    console.log('Generated mask URL:', maskUrl);

    // Add retry logic for fetching the mask
    const maxRetries = 3;
    let retryCount = 0;
    let maskResponse;

    while (retryCount < maxRetries) {
      try {
        maskResponse = await fetch(maskUrl);
        if (maskResponse.ok) break;
        
        // If not successful, wait before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
        retryCount++;
      } catch (error) {
        console.error(`Attempt ${retryCount + 1} failed:`, error);
        if (retryCount === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 2000));
        retryCount++;
      }
    }

    if (!maskResponse || !maskResponse.ok) {
      throw new Error(`Failed to fetch mask after ${maxRetries} attempts`);
    }

    const maskBlob = await maskResponse.blob();
    const maskBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(maskBlob);
    });

    console.log('Mask generated successfully');
    return maskBase64;
  } catch (error) {
    console.error('Error in createBinaryMask:', error);
    throw error;
  }
};
