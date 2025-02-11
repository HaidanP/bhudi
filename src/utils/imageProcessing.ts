
import * as tf from '@tensorflow/tfjs';
import * as bodyPix from '@tensorflow-models/body-pix';
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
  const model = await bodyPix.load({
    architecture: 'ResNet50',
    outputStride: 16,
    quantBytes: 4
  });
  return model;
};

// Define the parts we want to include in the mask
const CLOTHING_PARTS = [
  'left_sleeve', 'right_sleeve',
  'torso_front', 'torso_back',
  'left_shoe', 'right_shoe',
  'left_boot', 'right_boot'
];

export const createBinaryMask = async (canvas: HTMLCanvasElement): Promise<string> => {
  try {
    const model = await loadSegmentationModel();
    const segmentation = await model.segmentPersonParts(canvas, {
      flipHorizontal: false,
      internalResolution: 'full',
      segmentationThreshold: 0.7,
    });

    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const maskCtx = maskCanvas.getContext('2d')!;

    // Set black background (preserved areas)
    maskCtx.fillStyle = 'black';
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

    // Get colored parts data
    const coloredPartImage = bodyPix.toColoredPartMask(segmentation);
    const bytes = new Uint8ClampedArray(canvas.width * canvas.height * 4);

    for (let i = 0; i < segmentation.data.length; i++) {
      const partId = segmentation.data[i];
      const partName = segmentation.allPoses[0]?.bodyParts[partId]?.part;
      
      // Check if this part should be included in the mask
      if (partName && CLOTHING_PARTS.includes(partName)) {
        const j = i * 4;
        bytes[j] = 255;     // R
        bytes[j + 1] = 255; // G
        bytes[j + 2] = 255; // B
        bytes[j + 3] = 255; // A
      } else {
        const j = i * 4;
        bytes[j] = 0;     // R
        bytes[j + 1] = 0; // G
        bytes[j + 2] = 0; // B
        bytes[j + 3] = 255; // A
      }
    }

    const imageData = new ImageData(bytes, canvas.width, canvas.height);
    maskCtx.putImageData(imageData, 0, 0);

    console.log('Generated clothing-specific segmentation mask');
    return maskCanvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error in segmentation:', error);
    throw error;
  }
};
