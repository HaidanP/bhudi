import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { Toolbar } from "./Toolbar";
import { PromptInput } from "./PromptInput";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const ImageEditor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
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

        fabricCanvas.setDimensions({
          width: newWidth,
          height: newHeight,
        });

        fabricCanvas.setBackgroundImage(e.target?.result as string, () => {
          fabricCanvas.renderAll();
          setOriginalImage(e.target?.result as string);
          setGeneratedImage(null);
          toast("Image uploaded successfully!");
        }, {
          scaleX: newWidth / img.width,
          scaleY: newHeight / img.height,
          originX: 'left',
          originY: 'top'
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

  const createBinaryMask = (canvas: fabric.Canvas): string => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width!;
    tempCanvas.height = canvas.height!;
    const ctx = tempCanvas.getContext('2d')!;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    ctx.fillStyle = 'white';
    const objects = canvas.getObjects();
    objects.forEach(obj => {
      if (obj instanceof fabric.Path) {
        const path = obj as fabric.Path;
        ctx.beginPath();
        const pathCommands = path.path;
        pathCommands?.forEach((command, i) => {
          const [type, ...points] = command;
          if (i === 0) {
            ctx.moveTo(points[0], points[1]);
          } else if (type === 'Q') {
            ctx.quadraticCurveTo(points[0], points[1], points[2], points[3]);
          } else if (type === 'L') {
            ctx.lineTo(points[0], points[1]);
          }
        });
        ctx.fill();
      }
    });

    return tempCanvas.toDataURL();
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
              <div className="canvas-container bg-white rounded-lg overflow-hidden flex items-center justify-center">
                <canvas ref={canvasRef} />
              </div>
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
