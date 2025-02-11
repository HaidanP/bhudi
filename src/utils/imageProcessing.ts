
import { fabric } from "fabric";
import { supabase } from "@/integrations/supabase/client";
import * as tf from '@tensorflow/tfjs';
import * as bodySegmentation from '@tensorflow-models/body-segmentation';

export const uploadToSupabase = async (base64Data: string, filename: string): Promise<string> => {
  try {
    // Convert base64 to blob
    const base64Response = await fetch(base64Data);
    const blob = await base64Response.blob();
    
    const filePath = `${crypto.randomUUID()}-${filename}`;
    
    // Upload the file
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

    // Get the public URL
    const { data } = await supabase.storage
      .from('images')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

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

export const createBinaryMask = async (canvas: fabric.Canvas): Promise<string> => {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width!;
  tempCanvas.height = canvas.height!;
  const ctx = tempCanvas.getContext('2d')!;

  // Draw the background image to the temp canvas
  const backgroundImage = canvas.backgroundImage as fabric.Image;
  if (!backgroundImage) {
    throw new Error('No background image found');
  }

  ctx.drawImage(
    backgroundImage.getElement() as HTMLImageElement,
    0,
    0,
    tempCanvas.width,
    tempCanvas.height
  );

  try {
    // Load and run segmentation model
    const model = await loadSegmentationModel();
    const segmentation = await model.segmentPeople(tempCanvas, {
      multiSegmentation: false,
      segmentBodyParts: true,
    });

    // Create final mask canvas
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = tempCanvas.width;
    maskCanvas.height = tempCanvas.height;
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

    // Apply user's drawing as a mask
    const userMaskCanvas = document.createElement('canvas');
    userMaskCanvas.width = tempCanvas.width;
    userMaskCanvas.height = tempCanvas.height;
    const userMaskCtx = userMaskCanvas.getContext('2d')!;

    // Draw user's paths in white
    userMaskCtx.fillStyle = 'white';
    const objects = canvas.getObjects();
    objects.forEach(obj => {
      if (obj instanceof fabric.Path) {
        const path = obj as fabric.Path;
        userMaskCtx.beginPath();
        const pathCommands = path.path;
        pathCommands?.forEach((command, i) => {
          const commandType = command[0];
          if (i === 0) {
            userMaskCtx.moveTo(command[1], command[2]);
          } else if (commandType === 'Q') {
            userMaskCtx.quadraticCurveTo(command[1], command[2], command[3], command[4]);
          } else if (commandType === 'L') {
            userMaskCtx.lineTo(command[1], command[2]);
          }
        });
        userMaskCtx.fill();
      }
    });

    // Combine segmentation mask with user's mask
    const userMaskData = userMaskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      // Only set white pixels where both the segmentation detected a person AND user drew
      if (imageData.data[i + 3] > 0 && userMaskData.data[i] > 0) {
        maskCtx.fillStyle = 'white';
        const x = (i / 4) % maskCanvas.width;
        const y = Math.floor((i / 4) / maskCanvas.width);
        maskCtx.fillRect(x, y, 1, 1);
      }
    }

    console.log('Generated segmented mask image');
    return maskCanvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error in segmentation:', error);
    throw error;
  }
};
