
import { useState } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { uploadToSupabase } from "@/utils/imageProcessing";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "./ui/button";
import { Upload } from "lucide-react";
import { PromptInput } from "./PromptInput";
import { Canvas } from "./Canvas";
import { DrawingToolbar } from "./DrawingToolbar";
import { fabric } from "fabric";

export const ImageEditor = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [actualImageDimensions, setActualImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [activeTool, setActiveTool] = useState<"brush" | "eraser">("brush");
  const [brushSize, setBrushSize] = useState(20);
  const isMobile = useIsMobile();

  const handleImageUpload = async (file: File) => {
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

    canvas.freeDrawingBrush.width = brushSize;
    canvas.freeDrawingBrush.color = activeTool === "eraser" ? "black" : "white";
  };

  const handleToolChange = (tool: "brush" | "eraser") => {
    setActiveTool(tool);
    if (fabricCanvas) {
      fabricCanvas.freeDrawingBrush.color = tool === "eraser" ? "black" : "white";
    }
  };

  const handleBrushSizeChange = (size: number) => {
    setBrushSize(size);
    if (fabricCanvas) {
      fabricCanvas.freeDrawingBrush.width = size;
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

  const handleSubmit = async (prompt: string) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-fuchsia-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8 md:space-y-10">
        <Header />

        <div className="space-y-6 md:space-y-8 bg-white/40 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-xl border border-white">
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="image-upload"
            />
            <Button 
              variant="outline" 
              className="gap-3 w-full md:w-auto h-12 px-6 text-base font-medium border-2 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300" 
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              <Upload size={20} />
              Upload Image
            </Button>
            
            {originalImage && (
              <DrawingToolbar
                activeTool={activeTool}
                brushSize={brushSize}
                onToolChange={handleToolChange}
                onBrushSizeChange={handleBrushSizeChange}
              />
            )}
          </div>

          <div className={`flex ${isMobile ? 'flex-col' : ''} gap-6 md:gap-8`}>
            {originalImage && (
              <div className={`${isMobile ? 'w-full' : 'flex-1'}`}>
                <h3 className="text-base font-medium text-slate-700 mb-3">Draw on the areas to edit</h3>
                <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-slate-200">
                  <Canvas 
                    onCanvasReady={handleCanvasReady}
                    width={originalDimensions?.width || 512}
                    height={originalDimensions?.height || 512}
                  />
                </div>
              </div>
            )}

            {generatedImage && (
              <div className={`${isMobile ? 'w-full' : 'flex-1'}`}>
                <h3 className="text-base font-medium text-slate-700 mb-3">Generated Result</h3>
                <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-slate-200 flex items-center justify-center">
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
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-white text-center space-y-4">
                <div className="animate-spin w-12 h-12 border-4 border-purple-300/30 border-t-purple-300 rounded-full mx-auto" />
                <p className="text-lg font-medium">Processing your image...</p>
              </div>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
};
