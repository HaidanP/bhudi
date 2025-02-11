import * as tf from '@tensorflow/tfjs';
import * as bodySegmentation from '@tensorflow-models/body-segmentation';
import * as blazeface from '@tensorflow-models/blazeface';
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

const loadFaceModel = async () => {
  return await blazeface.load();
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
    const [segmentationModel, faceModel] = await Promise.all([
      loadSegmentationModel(),
      loadFaceModel()
    ]);

    const faceDetections = await faceModel.estimateFaces(canvas, false);
    
    const segmentation = await segmentationModel.segmentPeople(canvas, {
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
      const foregroundMask = await segmentation[0].mask.toImageData();
      const bytes = new Uint8ClampedArray(canvas.width * canvas.height * 4);
      
      // Create face exclusion mask using detected faces
      const facePixels = new Set<number>();
      for (const face of faceDetections) {
        const topLeft = face.topLeft as [number, number];
        const bottomRight = face.bottomRight as [number, number];
        
        // Add some padding around the face
        const padding = 20;
        const startX = Math.max(0, Math.floor(topLeft[0]) - padding);
        const startY = Math.max(0, Math.floor(topLeft[1]) - padding);
        const endX = Math.min(canvas.width, Math.ceil(bottomRight[0]) + padding);
        const endY = Math.min(canvas.height, Math.ceil(bottomRight[1]) + padding);

        // Mark all pixels in the face region
        for (let y = startY; y < endY; y++) {
          for (let x = startX; x < endX; x++) {
            const pixelIndex = (y * canvas.width + x) * 4;
            facePixels.add(pixelIndex);
          }
        }
      }

      // Process the mask data
      for (let i = 0; i < foregroundMask.data.length; i += 4) {
        // Skip if this pixel is part of a face
        if (facePixels.has(i)) {
          const j = i;
          bytes[j] = 0;     // R
          bytes[j + 1] = 0; // G
          bytes[j + 2] = 0; // B
          bytes[j + 3] = 255; // A
          continue;
        }

        // Include other body parts in the mask
        if (foregroundMask.data[i + 3] > 0) {
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

    console.log('Generated body segmentation mask with face exclusion');
    return maskCanvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error in segmentation:', error);
    throw error;
  }
};
