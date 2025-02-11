
import { supabase } from "@/integrations/supabase/client";
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
    console.log('TensorFlow backend initialized');

    // Load the pre-trained model
    const model = await tf.loadGraphModel(
      'https://tfhub.dev/tensorflow/tfjs-model/ssd_mobilenet_v2/1/default/1',
      { fromTFHub: true }
    );
    
    console.log('Model loaded successfully');

    // Create a tensor from the canvas
    const img = new Image();
    img.src = canvas.toDataURL();
    await new Promise(resolve => img.onload = resolve);

    // Prepare the input tensor
    const tensor = tf.browser.fromPixels(img)
      .resizeBilinear([300, 300])
      .expandDims()
      .toFloat();

    // Run object detection
    console.log('Running detection...');
    const predictions = await model.executeAsync(tensor) as tf.Tensor[];

    // Get detection boxes and classes
    const boxes = predictions[1].arraySync()[0];
    const scores = predictions[2].arraySync()[0];
    const classes = predictions[3].arraySync()[0];

    // Create a new canvas for the mask
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const ctx = maskCanvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Create binary mask
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    // Initialize mask data to black
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 0;     // R
      data[i + 1] = 0; // G
      data[i + 2] = 0; // B
      data[i + 3] = 255; // A
    }

    // Draw detected objects on the mask
    for (let i = 0; i < scores.length; i++) {
      if (scores[i] > 0.5) { // Only consider detections with confidence > 50%
        const [y1, x1, y2, x2] = boxes[i];
        const x = Math.floor(x1 * canvas.width);
        const y = Math.floor(y1 * canvas.height);
        const width = Math.floor((x2 - x1) * canvas.width);
        const height = Math.floor((y2 - y1) * canvas.height);

        // Fill the detected region with white
        for (let py = y; py < y + height; py++) {
          for (let px = x; px < x + width; px++) {
            if (px >= 0 && px < canvas.width && py >= 0 && py < canvas.height) {
              const idx = (py * canvas.width + px) * 4;
              data[idx] = 255;     // R
              data[idx + 1] = 255; // G
              data[idx + 2] = 255; // B
              data[idx + 3] = 255; // A
            }
          }
        }
      }
    }

    // Clean up tensors
    tensor.dispose();
    predictions.forEach(t => t.dispose());

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
