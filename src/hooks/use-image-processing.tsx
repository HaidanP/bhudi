import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { uploadToSupabase } from "@/utils/imageProcessing";
import { fabric } from "fabric";
import heic2any from "heic2any";

export function useImageProcessing() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [actualImageDimensions, setActualImageDimensions] = useState<{ width: number; height: number } | null>(null);

  const resetState = () => {
    setOriginalImage(null);
    setGeneratedImage(null);
    setOriginalDimensions(null);
    setActualImageDimensions(null);
    if (fabricCanvas) {
      fabricCanvas.clear();
      fabricCanvas.backgroundColor = 'transparent';
      fabricCanvas.renderAll();
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      let processedFile = file;
      
      // Convert HEIC to JPEG if needed
      if (file.type === "image/heic" || file.type === "image/heif") {
        toast.info("Converting HEIC image...");
        const convertedBlob = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.8
        });
        processedFile = new File([convertedBlob as Blob], file.name.replace(/\.heic$/i, '.jpg'), {
          type: 'image/jpeg'
        });
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setActualImageDimensions({ width: img.width, height: img.height });
          
          const maxDimension = 512;
          const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
          const scaledWidth = Math.round(img.width * scale);
          const scaledHeight = Math.round(img.height * scale);
          
          setOriginalDimensions({ width: scaledWidth, height: scaledHeight });
          setOriginalImage(e.target?.result as string);
          setGeneratedImage(null);
          toast.success("Image uploaded successfully!");
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(processedFile);
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error("Failed to process image. Please try a different format.");
    }
  };

  const handleCanvasReady = (canvas: fabric.Canvas) => {
    setFabricCanvas(canvas);
    if (originalImage) {
      fabric.Image.fromURL(originalImage, (img) => {
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
          scaleX: canvas.width! / img.width!,
          scaleY: canvas.height! / img.height!,
          originX: 'left',
          originY: 'top'
        });
      });
    }
  };

  const getMaskFromCanvas = () => {
    if (!fabricCanvas || !actualImageDimensions) return null;
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = actualImageDimensions.width;
    tempCanvas.height = actualImageDimensions.height;
    const ctx = tempCanvas.getContext('2d')!;
    
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    const scaleX = actualImageDimensions.width / fabricCanvas.width!;
    const scaleY = actualImageDimensions.height / fabricCanvas.height!;
    
    ctx.strokeStyle = 'white';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    fabricCanvas.getObjects().forEach(obj => {
      if (obj.type === 'path') {
        const path = obj as fabric.Path;
        ctx.lineWidth = path.strokeWidth! * scaleX * 1.2;
        ctx.beginPath();
        const pathData = path.path;
        pathData?.forEach((segment: any, i: number) => {
          if (i === 0) {
            ctx.moveTo(segment[1] * scaleX, segment[2] * scaleY);
          } else {
            ctx.lineTo(segment[1] * scaleX, segment[2] * scaleY);
          }
        });
        ctx.stroke();
      }
    });
    
    fabricCanvas.getObjects().forEach(obj => {
      if (obj.type === 'path') {
        const path = obj as fabric.Path;
        ctx.lineWidth = path.strokeWidth! * scaleX * 0.8;
        ctx.beginPath();
        const pathData = path.path;
        pathData?.forEach((segment: any, i: number) => {
          if (i === 0) {
            ctx.moveTo(segment[1] * scaleX, segment[2] * scaleY);
          } else {
            ctx.lineTo(segment[1] * scaleX, segment[2] * scaleY);
          }
        });
        ctx.stroke();
      }
    });
    
    return tempCanvas.toDataURL();
  };

  const processImage = async (prompt: string) => {
    if (!originalImage || !originalDimensions) {
      toast.error("Please upload an image first!");
      return;
    }

    setIsProcessing(true);
    
    try {
      const maskDataUrl = getMaskFromCanvas();
      if (!maskDataUrl) {
        toast.error("Please draw a mask first!");
        return;
      }
      
      const originalImageUrl = await uploadToSupabase(
        originalImage,
        'original.png'
      );

      const maskImageUrl = await uploadToSupabase(
        maskDataUrl,
        'mask.png'
      );

      const { data, error } = await supabase.functions.invoke('process-image', {
        body: {
          originalImage: originalImageUrl,
          maskImage: maskImageUrl,
          prompt
        },
      });

      if (error) throw error;

      if (data.output) {
        setGeneratedImage(data.output);
        toast.success("Image processed successfully!");
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to process image");
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    originalImage,
    isProcessing,
    generatedImage,
    originalDimensions,
    handleImageUpload,
    handleCanvasReady,
    processImage,
    resetState,
  };
}
