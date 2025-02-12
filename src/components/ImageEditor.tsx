
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
import { useState } from "react";

export const ImageEditor = () => {
  const [activeTool, setActiveTool] = useState<"brush" | "eraser">("brush");
  const [brushSize, setBrushSize] = useState(20);
  const isMobile = useIsMobile();
  
  const {
    originalImage,
    isProcessing,
    generatedImage,
    originalDimensions,
    handleImageUpload,
    handleCanvasReady,
    processImage,
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#1A1F2C] to-black p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8 md:space-y-10">
        <Header />

        <div className="space-y-6 md:space-y-8 bg-black/60 backdrop-blur-md rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl border border-white/10">
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <ImageUploadButton onFileChange={handleFileChange} />
            
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
            {originalImage && originalDimensions && (
              <ImagePreview
                onCanvasReady={handleCanvasReady}
                width={originalDimensions.width}
                height={originalDimensions.height}
                brushSize={brushSize}
              />
            )}

            {generatedImage && (
              <GeneratedResult imageUrl={generatedImage} />
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
