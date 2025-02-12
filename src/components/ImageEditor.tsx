
import { useState } from "react";
import { Header } from "./Header";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createBinaryMask, uploadToSupabase } from "@/utils/imageProcessing";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "./ui/button";
import { Upload } from "lucide-react";
import { PromptInput } from "./PromptInput";
import { Canvas } from "./Canvas";
import { fabric } from "fabric";

export const ImageEditor = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedMask, setGeneratedMask] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [actualImageDimensions, setActualImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const isMobile = useIsMobile();

  const handleImageUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Store actual image dimensions
        setActualImageDimensions({ width: img.width, height: img.height });
        
        // Calculate display dimensions that maintain aspect ratio and fit within reasonable bounds
        const maxDimension = 512;
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const scaledWidth = Math.round(img.width * scale);
        const scaledHeight = Math.round(img.height * scale);
        
        setOriginalDimensions({ width: scaledWidth, height: scaledHeight });
        setOriginalImage(e.target?.result as string);
        setGeneratedImage(null);
        setGeneratedMask(null);
        toast.success("Image uploaded successfully!");
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
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
    
    // Create a temporary canvas at the original image dimensions
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = actualImageDimensions.width;
    tempCanvas.height = actualImageDimensions.height;
    const ctx = tempCanvas.getContext('2d')!;
    
    // Draw white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Calculate scale factor between display size and actual size
    const scaleX = actualImageDimensions.width / fabricCanvas.width!;
    const scaleY = actualImageDimensions.height / fabricCanvas.height!;
    
    // Draw black paths scaled to match original image dimensions
    ctx.strokeStyle = 'black';
    fabricCanvas.getObjects().forEach(obj => {
      if (obj.type === 'path') {
        const path = obj as fabric.Path;
        ctx.lineWidth = path.strokeWidth! * scaleX; // Scale stroke width
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

  const handleSubmit = async (prompt: string) => {
    if (!originalImage || !originalDimensions) {
      toast.error("Please upload an image first!");
      return;
    }

    setIsProcessing(true);
    
    try {
      // Get mask from canvas instead of generating it
      const maskDataUrl = getMaskFromCanvas();
      if (!maskDataUrl) {
        toast.error("Please draw a mask first!");
        return;
      }
      
      setGeneratedMask(maskDataUrl);
      
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        <Header />

        <div className="glass-panel rounded-xl p-4 md:p-8 space-y-4 md:space-y-6">
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="image-upload"
            />
            <Button 
              variant="outline" 
              className="gap-2 w-full md:w-auto" 
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              <Upload size={16} />
              Upload Image
            </Button>
          </div>

          <div className={`flex ${isMobile ? 'flex-col' : ''} gap-4 md:gap-8`}>
            {originalImage && (
              <div className={`${isMobile ? 'w-full' : 'flex-1'}`}>
                <h3 className="text-sm font-medium mb-2">Draw Mask</h3>
                <Canvas 
                  onCanvasReady={handleCanvasReady}
                  width={originalDimensions?.width || 512}
                  height={originalDimensions?.height || 512}
                />
              </div>
            )}

            {generatedMask && (
              <div className={`${isMobile ? 'w-full' : 'flex-1'}`}>
                <h3 className="text-sm font-medium mb-2">Generated Mask</h3>
                <div className="bg-white rounded-lg overflow-hidden flex items-center justify-center">
                  <img 
                    src={generatedMask} 
                    alt="Mask" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            {generatedImage && (
              <div className={`${isMobile ? 'w-full' : 'flex-1'}`}>
                <h3 className="text-sm font-medium mb-2">Generated Result</h3>
                <div className="bg-white rounded-lg overflow-hidden flex items-center justify-center">
                  <img 
                    src={generatedImage} 
                    alt="Generated" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          <PromptInput onSubmit={handleSubmit} disabled={isProcessing} />

          {isProcessing && (
            <div className="loading-overlay">
              <div className="text-white text-center space-y-4">
                <div className="animate-spin w-10 h-10 border-4 border-white/20 border-t-white rounded-full" />
                <p>Processing your image...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
