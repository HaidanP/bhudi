
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

    // Use CLIPSeg for semantic segmentation
    const { data: segmentationData, error: segmentationError } = await supabase.functions.invoke('create-mask', {
      body: {
        image: imageUrl,
        text_prompt: "clothes, clothing items, outfit"
      }
    });

    if (segmentationError) {
      throw segmentationError;
    }

    // Convert the segmentation mask URL to base64
    const maskResponse = await fetch(segmentationData.maskUrl);
    const maskBlob = await maskResponse.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(maskBlob);
    });
  } catch (error) {
    console.error('Error in createBinaryMask:', error);
    throw error;
  }
};
