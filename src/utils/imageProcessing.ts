
import * as tf from '@tensorflow/tfjs';
import * as bodySegmentation from '@tensorflow-models/body-segmentation';
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

export const loadSegmentationModel = async () => {
  await tf.ready();
  const model = await bodySegmentation.createSegmenter(
    bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation,
    {
      runtime: 'tfjs',
      modelType: 'general'
    }
  );
  return model;
};

export const createBinaryMask = async (canvas: HTMLCanvasElement): Promise<string> => {
  try {
    const model = await loadSegmentationModel();
    const segmentation = await model.segmentPeople(canvas, {
      multiSegmentation: false,
      segmentBodyParts: false
    });

    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const maskCtx = maskCanvas.getContext('2d')!;

    // Set black background (preserved areas)
    maskCtx.fillStyle = 'black';
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

    if (segmentation.length > 0) {
      // Get the segmentation mask
      const foregroundMask = await segmentation[0].mask.toImageData();
      
      // Process the mask data to create binary mask
      const bytes = new Uint8ClampedArray(canvas.width * canvas.height * 4);
      
      // Create a binary mask focusing on the body area
      for (let i = 0; i < foregroundMask.data.length; i += 4) {
        // Skip the head area (approximately top 25% of the detected person)
        const y = Math.floor((i / 4) / canvas.width);
        const personHeight = canvas.height;
        const isInHeadArea = y < personHeight * 0.25;

        if (foregroundMask.data[i + 3] > 0 && !isInHeadArea) {
          const j = i;
          bytes[j] = 255;     // R
          bytes[j + 1] = 255; // G
          bytes[j + 2] = 255; // B
          bytes[j + 3] = 255; // A
        } else {
          const j = i;
          bytes[j] = 0;     // R
          bytes[j + 1] = 0; // G
          bytes[j + 2] = 0; // B
          bytes[j + 3] = 255; // A
        }
      }

      const imageData = new ImageData(bytes, canvas.width, canvas.height);
      maskCtx.putImageData(imageData, 0, 0);
    }

    console.log('Generated body segmentation mask');
    return maskCanvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error in segmentation:', error);
    throw error;
  }
};
