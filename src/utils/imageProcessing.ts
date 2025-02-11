
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
      modelType: 'general',
    }
  );
  return model;
};

export const createBinaryMask = async (canvas: HTMLCanvasElement): Promise<string> => {
  try {
    const model = await loadSegmentationModel();
    const segmentation = await model.segmentPeople(canvas, {
      multiSegmentation: false,
      segmentBodyParts: true,
    });

    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const maskCtx = maskCanvas.getContext('2d')!;

    // Set black background (preserved areas)
    maskCtx.fillStyle = 'black';
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

    // Get segmentation data
    const foregroundMask = await segmentation[0].mask.toImageData();
    const imageData = new ImageData(
      foregroundMask.data,
      foregroundMask.width,
      foregroundMask.height
    );

    // Set white for the detected person areas (areas to inpaint)
    for (let i = 0; i < imageData.data.length; i += 4) {
      if (imageData.data[i + 3] > 0) {
        maskCtx.fillStyle = 'white';
        const x = (i / 4) % maskCanvas.width;
        const y = Math.floor((i / 4) / maskCanvas.width);
        maskCtx.fillRect(x, y, 1, 1);
      }
    }

    console.log('Generated segmentation mask');
    return maskCanvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error in segmentation:', error);
    throw error;
  }
};
