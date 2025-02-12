
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useIsMobile } from "@/hooks/use-mobile";
import { PromptInput } from "./PromptInput";
import { DrawingToolbar } from "./DrawingToolbar";
import { ImageUploadButton } from "./ImageUploadButton";
import { ImagePreview } from "./ImagePreview";
import { GeneratedResult } from "./GeneratedResult";
import { LoadingOverlay } from "./LoadingOverlay";
import { useImageProcessing } from "@/hooks/use-image-processing";
import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { RefreshCw, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export const ImageEditor = () => {
  const [activeTool, setActiveTool] = useState<"brush" | "eraser">("brush");
  const [brushSize, setBrushSize] = useState(20);
  const isMobile = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    originalImage,
    isProcessing,
    generatedImage,
    originalDimensions,
    handleImageUpload,
    handleCanvasReady,
    processImage,
    resetState
  } = useImageProcessing();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleToolChange = (tool: "brush" | "eraser") => {
    setActiveTool(tool);
  };

  const handleBrushSizeChange = (size: number) => {
    setBrushSize(size);
  };

  const handleRetry = () => {
    resetState();
    toast.success("Canvas cleared! You can start over.");
  };

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#1A1F2C] to-black p-4 md:p-8 animate-fade-in">
      <div className="relative max-w-6xl mx-auto space-y-12 md:space-y-16">
        <div className="absolute inset-0 bg-gradient-to-b from-rose-500/10 via-transparent to-transparent opacity-50 pointer-events-none blur-3xl" />
        
        <Header />

        <div className="relative space-y-8 md:space-y-10 bg-black/40 backdrop-blur-xl rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/10 transition-all duration-500 hover:shadow-[0_8px_32px_rgba(255,255,255,0.1)] group">
          <div className="flex flex-col md:flex-row gap-5 items-start">
            <div className="flex gap-3 w-full md:w-auto">
              <ImageUploadButton onFileChange={handleFileChange} />
              
              {originalImage && (
                <>
                  <Button
                    variant="outline"
                    className="h-12 px-4 border-rose-800/50 hover:bg-rose-800/10 hover:text-rose-500 text-rose-600 transition-all duration-300 transform hover:scale-105 active:scale-95"
                    onClick={handleGalleryClick}
                  >
                    <ImageIcon size={20} className="animate-pulse" />
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </>
              )}
            </div>
            
            {originalImage && (
              <DrawingToolbar
                activeTool={activeTool}
                brushSize={brushSize}
                onToolChange={handleToolChange}
                onBrushSizeChange={handleBrushSizeChange}
              />
            )}
          </div>

          <div className={`flex ${isMobile ? 'flex-col' : ''} gap-8 md:gap-10`}>
            {originalImage && originalDimensions && (
              <ImagePreview
                onCanvasReady={handleCanvasReady}
                width={originalDimensions.width}
                height={originalDimensions.height}
                brushSize={brushSize}
              />
            )}

            {generatedImage && (
              <GeneratedResult 
                imageUrl={generatedImage} 
                onReset={handleRetry}
              />
            )}
          </div>

          <PromptInput onSubmit={processImage} disabled={isProcessing} />
        </div>

        <Footer />
      </div>

      <LoadingOverlay isVisible={isProcessing} />
    </div>
  );
};
