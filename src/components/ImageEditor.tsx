
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
import { SparklesCore } from "./ui/sparkles";
import { Alert } from "./ui/alert";
import { CircleCheck, AlertCircle } from "lucide-react";

export const ImageEditor = () => {
  const [activeTool, setActiveTool] = useState<"brush" | "eraser">("brush");
  const [brushSize, setBrushSize] = useState(20);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
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

  const handleProcessImage = async (prompt: string) => {
    try {
      await processImage(prompt);
      setSuccess(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSuccess(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a]">
      <div className="absolute inset-0 w-full h-full opacity-60">
        <SparklesCore
          id="tsparticles"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-4 space-y-6">
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
              
              {error && (
                <Alert
                  variant="error"
                  layout="row"
                  icon={<AlertCircle className="text-red-500" size={16} strokeWidth={2} />}
                  className="bg-red-500/10 text-red-500"
                >
                  <p className="text-sm">{error}</p>
                </Alert>
              )}

              {success && generatedImage && (
                <Alert
                  variant="success"
                  layout="row"
                  icon={<CircleCheck className="text-emerald-500" size={16} strokeWidth={2} />}
                  className="bg-emerald-500/10 text-emerald-500"
                >
                  <p className="text-sm">Image generated successfully!</p>
                </Alert>
              )}
              
              {generatedImage && (
                <GeneratedResult 
                  imageUrl={generatedImage} 
                  onReset={() => {
                    resetState();
                    setSuccess(false);
                    setError(null);
                  }}
                />
              )}
            </div>
          )}

          <PromptInput onSubmit={handleProcessImage} disabled={isProcessing} />
        </div>

        <Footer />
      </div>

      <LoadingOverlay isVisible={isProcessing} />
    </div>
  );
};
