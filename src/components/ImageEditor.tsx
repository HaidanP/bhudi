
import { Header } from "./Header";
import { Footer } from "./Footer";
import { PromptInput } from "./PromptInput";
import { DrawingToolbar } from "./DrawingToolbar";
import { ImageUploadButton } from "./ImageUploadButton";
import { ImagePreview } from "./ImagePreview";
import { GeneratedResult } from "./GeneratedResult";
import { LoadingOverlay } from "./LoadingOverlay";
import { useImageProcessing } from "@/hooks/use-image-processing";
import { useState } from "react";
import type { ChangeEvent } from "react";

export const ImageEditor = () => {
  const [activeTool, setActiveTool] = useState<"brush" | "eraser">("brush");
  const [brushSize, setBrushSize] = useState(20);
  
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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_center,#141414,#0a0a0a)] p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <Header />

        <div className="mt-14 space-y-6">
          <ImageUploadButton onFileChange={handleFileChange} />
          
          {originalImage && (
            <div className="container-width space-y-6">
              <DrawingToolbar
                activeTool={activeTool}
                brushSize={brushSize}
                onToolChange={setActiveTool}
                onBrushSizeChange={setBrushSize}
              />
              
              <ImagePreview
                onCanvasReady={handleCanvasReady}
                width={originalDimensions?.width}
                height={originalDimensions?.height}
                brushSize={brushSize}
              />
              
              {generatedImage && (
                <GeneratedResult 
                  imageUrl={generatedImage} 
                  onReset={resetState}
                />
              )}
            </div>
          )}

          <PromptInput onSubmit={processImage} disabled={isProcessing} />
        </div>

        <Footer />
      </div>

      <LoadingOverlay isVisible={isProcessing} />
    </div>
  );
};
