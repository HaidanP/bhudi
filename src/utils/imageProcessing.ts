
import { supabase } from "@/integrations/supabase/client";

const MAX_IMAGE_DIMENSION = 512; // Limit image size to avoid memory issues

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

    // The model returns a URL to the generated mask
    const maskUrl = response.data.output;
    
    // Convert the mask URL to base64
    const maskResponse = await fetch(maskUrl);
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
