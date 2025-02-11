
import { useState } from "react";
import { fabric } from "fabric";
import { Toolbar } from "./Toolbar";
import { PromptInput } from "./PromptInput";
import { Canvas } from "./Canvas";
import { Header } from "./Header";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createBinaryMask, uploadToSupabase } from "@/utils/imageProcessing";

export const ImageEditor = () => {
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [brushSize, setBrushSize] = useState(20);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 600 });

  const handleImageUpload = async (file: File) => {
    if (!fabricCanvas) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setOriginalDimensions({ width: img.width, height: img.height });

        const containerWidth = 800;
        const containerHeight = 600;
        const imgAspectRatio = img.width / img.height;
        const containerAspectRatio = containerWidth / containerHeight;
        
        let newWidth, newHeight;
        
        if (imgAspectRatio > containerAspectRatio) {
          newWidth = containerWidth;
          newHeight = containerWidth / imgAspectRatio;
        } else {
          newHeight = containerHeight;
          newWidth = containerHeight * imgAspectRatio;
        }

        // Update dimensions first
        setCanvasDimensions({ width: newWidth, height: newHeight });

        // Set background image after dimensions are updated
        const imgUrl = e.target?.result as string;
        fabricCanvas.setBackgroundImage(imgUrl, fabricCanvas.renderAll.bind(fabricCanvas), {
          scaleX: newWidth / img.width,
          scaleY: newHeight / img.height,
          originX: 'left',
          originY: 'top'
        });

        setOriginalImage(imgUrl);
        setGeneratedImage(null);
        toast("Image uploaded successfully!");
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleBrushSizeChange = (value: number) => {
    if (!fabricCanvas) return;
    setBrushSize(value);
    fabricCanvas.freeDrawingBrush.width = value;
  };

  const clearMask = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    if (originalImage) {
      fabricCanvas.setBackgroundImage(originalImage, () => {
        fabricCanvas.renderAll();
        toast("Mask cleared!");
      });
    }
  };

  const handleCanvasReady = (canvas: fabric.Canvas) => {
    canvas.freeDrawingBrush.width = brushSize;
    canvas.freeDrawingBrush.color = "rgba(255, 255, 255, 0.5)";
    setFabricCanvas(canvas);
  };

  const handleSubmit = async (prompt: string) => {
    if (!fabricCanvas || !originalImage || !originalDimensions) {
      toast.error("Please upload an image first!");
      return;
    }

    setIsProcessing(true);
    
    try {
      const maskDataUrl = createBinaryMask(fabricCanvas);
      
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = originalDimensions.width;
      tempCanvas.height = originalDimensions.height;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (!tempCtx) {
        throw new Error("Could not create temporary canvas context");
      }

      const maskImg = new Image();
      await new Promise((resolve, reject) => {
        maskImg.onload = resolve;
        maskImg.onerror = reject;
        maskImg.src = maskDataUrl;
      });

      tempCtx.fillStyle = 'black';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      tempCtx.drawImage(
        maskImg,
        0, 0,
        originalDimensions.width,
        originalDimensions.height
      );

      const originalImageUrl = await uploadToSupabase(
        originalImage,
        'original.png'
      );

      const scaledMaskUrl = await uploadToSupabase(
        tempCanvas.toDataURL(),
        'mask.png'
      );

      const { data, error } = await supabase.functions.invoke('process-image', {
        body: {
          originalImage: originalImageUrl,
          maskImage: scaledMaskUrl,
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <Header />

        <div className="glass-panel rounded-xl p-8 space-y-6">
          <Toolbar
            onImageUpload={handleImageUpload}
            brushSize={brushSize}
            onBrushSizeChange={handleBrushSizeChange}
            onClear={clearMask}
          />

          <div className="flex gap-8">
            <div className="flex-1">
              <h3 className="text-sm font-medium mb-2">Original & Mask</h3>
              <Canvas 
                onCanvasReady={handleCanvasReady}
                width={canvasDimensions.width}
                height={canvasDimensions.height}
              />
            </div>

            {generatedImage && (
              <div className="flex-1">
                <h3 className="text-sm font-medium mb-2">Generated Result</h3>
                <div className="canvas-container bg-white rounded-lg overflow-hidden flex items-center justify-center">
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
