
import { supabase } from "@/integrations/supabase/client";
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js to use browser
env.allowLocalModels = false;
env.useBrowserCache = false;

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
    
    // Initialize the segmentation model with a model that's good at detailed segmentation
    const segmenter = await pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512', {
      device: 'webgpu'
    });

    // Get image data from canvas
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    console.log('Image converted to data URL');

    // Process the image with the segmentation model
    console.log('Running segmentation...');
    const segments = await segmenter(imageData, {
      threshold: 0.5,
    });

    console.log('Segmentation complete:', segments);

    // Create a new canvas for the mask
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const ctx = maskCanvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Create binary mask from segmentation results
    const imageData2 = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData2.data;

    // Define clothing and exclusion labels
    const clothingLabels = ['dress', 'pants', 'shirt', 'jacket', 'clothing', 'skirt', 'top', 'coat', 'sweater', 'shorts'];
    const exclusionLabels = ['face', 'head', 'hair', 'person', 'neck'];

    // Find clothing and exclusion segments
    const clothingSegments = segments.filter((segment: any) => {
      return clothingLabels.some(label => segment.label.toLowerCase().includes(label));
    });

    const exclusionSegments = segments.filter((segment: any) => {
      return exclusionLabels.some(label => segment.label.toLowerCase().includes(label));
    });

    // Fill the mask with white for clothing pixels, black for others
    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % canvas.width;
      const y = Math.floor((i / 4) / canvas.width);
      const pixelIndex = y * canvas.width + x;
      
      // Check if this pixel belongs to any clothing segment
      const isClothing = clothingSegments.some((segment: any) => {
        return segment.mask.data[pixelIndex] > 0.5;
      });

      // Check if this pixel belongs to any exclusion segment
      const isExcluded = exclusionSegments.some((segment: any) => {
        return segment.mask.data[pixelIndex] > 0.3; // Lower threshold for exclusion areas
      });

      // Set pixel values (white for clothing, black for background or excluded areas)
      const shouldBeWhite = isClothing && !isExcluded;
      data[i] = shouldBeWhite ? 255 : 0;     // R
      data[i + 1] = shouldBeWhite ? 255 : 0; // G
      data[i + 2] = shouldBeWhite ? 255 : 0; // B
      data[i + 3] = 255;                     // A
    }

    ctx.putImageData(imageData2, 0, 0);
    console.log('Mask created successfully');

    // Convert to base64
    return maskCanvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error in createBinaryMask:', error);
    throw error;
  }
};
