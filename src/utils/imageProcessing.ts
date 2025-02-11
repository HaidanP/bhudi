
import { fabric } from "fabric";
import { supabase } from "@/integrations/supabase/client";

export const uploadToSupabase = async (base64Data: string, filename: string): Promise<string> => {
  const response = await fetch(base64Data);
  const blob = await response.blob();
  
  const filePath = `${crypto.randomUUID()}-${filename}`;
  const { data, error } = await supabase.storage
    .from('images')
    .upload(filePath, blob);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(filePath);

  return publicUrl;
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
  const objects = canvas.getObjects();
  objects.forEach(obj => {
    if (obj instanceof fabric.Path) {
      const path = obj as fabric.Path;
      ctx.beginPath();
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
      ctx.fill();
    }
  });

  return tempCanvas.toDataURL();
};
