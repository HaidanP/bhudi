
import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas } from "fabric";
import { Toolbar } from "./Toolbar";
import { PromptInput } from "./PromptInput";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const ImageEditor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      isDrawingMode: true,
      width: 800,
      height: 600,
    });

    canvas.freeDrawingBrush.width = brushSize;
    canvas.freeDrawingBrush.color = "rgba(255, 255, 255, 0.5)";
    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  const uploadToSupabase = async (base64Data: string, filename: string): Promise<string> => {
    // Convert base64 to blob
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

  const handleImageUpload = async (file: File) => {
    if (!fabricCanvas) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scaleFactor = Math.min(
          800 / img.width,
          600 / img.height
        );
        
        fabricCanvas.setDimensions({
          width: img.width * scaleFactor,
          height: img.height * scaleFactor,
        });

        fabricCanvas.setBackgroundImage(e.target?.result as string, () => {
          fabricCanvas.renderAll();
          setOriginalImage(e.target?.result as string);
          setGeneratedImage(null);
          toast("Image uploaded successfully!");
        });
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

  const handleSubmit = async (prompt: string) => {
    if (!fabricCanvas || !originalImage) {
      toast.error("Please upload an image first!");
      return;
    }

    setIsProcessing(true);
    
    try {
      // Upload original image and mask to Supabase
      const originalImageUrl = await uploadToSupabase(
        originalImage,
        'original.png'
      );

      // Get the mask data
      const maskDataUrl = fabricCanvas.toDataURL();
      const maskImageUrl = await uploadToSupabase(
        maskDataUrl,
        'mask.png'
      );

      // Call our edge function
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight">
            AI Clothing Editor
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload an image, mask the area you want to modify, and describe the changes you want to make.
          </p>
        </header>

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
              <div className="canvas-container">
                <canvas ref={canvasRef} />
              </div>
            </div>

            {generatedImage && (
              <div className="flex-1">
                <h3 className="text-sm font-medium mb-2">Generated Result</h3>
                <div className="canvas-container">
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
