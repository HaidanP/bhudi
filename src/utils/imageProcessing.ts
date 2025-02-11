import * as tf from '@tensorflow/tfjs';
import * as bodySegmentation from '@tensorflow-models/body-segmentation';
import { supabase } from "@/integrations/supabase/client";

export const uploadToSupabase = async (base64Data: string, filename: string): Promise<string> => {
  try {
    if (base64Data.startsWith('data:')) {
      const response = await fetch(base64Data);
      const blob = await response.blob();
      const filePath = `${crypto.randomUUID()}-${filename}`;
      
      console.log('Uploading blob:', { size: blob.size, type: blob.type });
      
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, blob, {
          contentType: 'image/png',
          cacheControl: '3600',
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
    } else {
      throw new Error('Invalid image data format');
    }
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
      segmentBodyParts: true // Enable body part segmentation
    });

    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const maskCtx = maskCanvas.getContext('2d')!;

    // Set black background (preserved areas)
    maskCtx.fillStyle = 'black';
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

    if (segmentation.length > 0) {
      const foregroundMask = await segmentation[0].mask.toImageData();
      const bytes = new Uint8ClampedArray(canvas.width * canvas.height * 4);

      // Find the person's bounding box
      let minY = canvas.height;
      let maxY = 0;
      
      // First pass to find the person's height bounds
      for (let i = 0; i < foregroundMask.data.length; i += 4) {
        if (foregroundMask.data[i + 3] > 0) {
          const y = Math.floor((i / 4) / canvas.width);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      }

      const personHeight = maxY - minY;
      const headHeight = personHeight * 0.2; // Head is approximately 1/5 of body height
      const neckPosition = minY + headHeight;
      const shoulderWidth = canvas.width * 0.25; // Approximate shoulder width
      
      // Second pass to create the binary mask
      for (let i = 0; i < foregroundMask.data.length; i += 4) {
        const x = (i / 4) % canvas.width;
        const y = Math.floor((i / 4) / canvas.width);
        
        // Calculate distance from vertical centerline
        const centerX = canvas.width / 2;
        const distanceFromCenter = Math.abs(x - centerX);

        // Check if pixel is in the head area using multiple criteria
        const isInHeadArea = (
          y < neckPosition && // Below the calculated neck position
          distanceFromCenter < shoulderWidth / 2 && // Within shoulder width
          foregroundMask.data[i + 3] > 0 // Is part of the person
        );

        if (foregroundMask.data[i + 3] > 0 && !isInHeadArea) {
          // Include in mask (white)
          bytes[i] = 255;     // R
          bytes[i + 1] = 255; // G
          bytes[i + 2] = 255; // B
          bytes[i + 3] = 255; // A
        } else {
          // Exclude from mask (black)
          bytes[i] = 0;     // R
          bytes[i + 1] = 0; // G
          bytes[i + 2] = 0; // B
          bytes[i + 3] = 255; // A
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
