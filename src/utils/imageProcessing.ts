
import { supabase } from "@/integrations/supabase/client";
import * as bodySegmentation from '@tensorflow-models/body-segmentation';
import * as tf from '@tensorflow/tfjs';

const MAX_IMAGE_DIMENSION = 512; // Limit image size to avoid memory issues

function resizeImageIfNeeded(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const width = canvas.width;
  const height = canvas.height;
  
  if (width <= MAX_IMAGE_DIMENSION && height <= MAX_IMAGE_DIMENSION) {
    return canvas;
  }

  const resizeCanvas = document.createElement('canvas');
  let newWidth = width;
  let newHeight = height;

  if (width > height) {
    newWidth = MAX_IMAGE_DIMENSION;
    newHeight = Math.round((height * MAX_IMAGE_DIMENSION) / width);
  } else {
    newHeight = MAX_IMAGE_DIMENSION;
    newWidth = Math.round((width * MAX_IMAGE_DIMENSION) / height);
  }

  resizeCanvas.width = newWidth;
  resizeCanvas.height = newHeight;
  const ctx = resizeCanvas.getContext('2d')!;
  ctx.drawImage(canvas, 0, 0, newWidth, newHeight);
  
  console.log(`Resized image from ${width}x${height} to ${newWidth}x${newHeight}`);
  return resizeCanvas;
}

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
    console.log('Starting segmentation process...');
    
    // Ensure TensorFlow backend is initialized
    await tf.ready();
    
    // Load the body segmentation model
    const model = await bodySegmentation.createSegmenter(
      bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation,
      {
        runtime: 'tfjs',
        modelType: 'general'
      }
    );
    
    console.log('Model loaded successfully');

    // Create an image element from the canvas
    const img = new Image();
    img.src = canvas.toDataURL();
    await new Promise(resolve => img.onload = resolve);

    // Run segmentation
    console.log('Running segmentation...');
    const segmentation = await model.segmentPeople(img, {
      multiSegmentation: false,
      segmentBodyParts: false
    });

    if (!segmentation.length) {
      throw new Error('No segmentation found');
    }

    // Create a new canvas for the mask
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const ctx = maskCanvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Get the segmentation mask
    const mask = segmentation[0];
    const maskData = await mask.mask.toImageData();
    
    // Create binary mask
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    
    // Convert the mask to binary (white for person, black for background)
    for (let i = 0; i < maskData.data.length; i += 4) {
      // The alpha channel contains the mask value
      const maskValue = maskData.data[i + 3] / 255;
      
      // Set RGB values to white or black based on mask
      const value = maskValue > 0.1 ? 255 : 0;
      data[i] = value;     // R
      data[i + 1] = value; // G
      data[i + 2] = value; // B
      data[i + 3] = 255;   // A (always fully opaque)
    }

    // Put the binary mask on the canvas
    ctx.putImageData(imageData, 0, 0);
    console.log('Mask created successfully');

    // Convert to base64
    return maskCanvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error in createBinaryMask:', error);
    throw error;
  }
};
