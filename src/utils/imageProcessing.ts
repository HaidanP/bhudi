
import { fabric } from "fabric";
import { supabase } from "@/integrations/supabase/client";

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

export const createBinaryMask = (canvas: fabric.Canvas): string => {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width!;
  tempCanvas.height = canvas.height!;
  const ctx = tempCanvas.getContext('2d')!;

  // Set black background (areas to preserve)
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

  // Set white for the mask (areas to inpaint)
  ctx.fillStyle = 'white';
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1.0; // Ensure full opacity for mask
  
  const objects = canvas.getObjects();
  objects.forEach(obj => {
    if (obj instanceof fabric.Path) {
      const path = obj as fabric.Path;
      ctx.beginPath();
      
      // Increase stroke width for more pronounced masking
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      const pathCommands = path.path;
      pathCommands?.forEach((command, i) => {
        const commandType = command[0];
        if (i === 0) {
          ctx.moveTo(command[1], command[2]);
        } else if (commandType === 'Q') {
          ctx.quadraticCurveTo(command[1], command[2], command[3], command[4]);
        } else if (commandType === 'L') {
          ctx.lineTo(command[1], command[2]);
        }
      });
      
      // Fill and stroke the path for better coverage
      ctx.fill();
      ctx.stroke();
    }
  });

  // Debug logging
  console.log('Generated mask image');
  
  return tempCanvas.toDataURL('image/png');
};
