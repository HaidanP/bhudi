
import { useState } from "react";
import { Header } from "./Header";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createBinaryMask, uploadToSupabase } from "@/utils/imageProcessing";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "./ui/button";
import { Upload } from "lucide-react";
import { PromptInput } from "./PromptInput";

export const ImageEditor = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedMask, setGeneratedMask] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const isMobile = useIsMobile();

  const handleImageUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setOriginalDimensions({ width: img.width, height: img.height });
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

  const handleSubmit = async (prompt: string) => {
    if (!originalImage || !originalDimensions) {
      toast.error("Please upload an image first!");
      return;
    }

    setIsProcessing(true);
    
    try {
      const tempImg = document.createElement('img');
      tempImg.src = originalImage;
      
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = originalDimensions.width;
      tempCanvas.height = originalDimensions.height;
      const ctx = tempCanvas.getContext('2d')!;
      ctx.drawImage(tempImg, 0, 0);
      
      // Generate mask using the segmentation model
      const maskDataUrl = await createBinaryMask(tempCanvas);
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
                <h3 className="text-sm font-medium mb-2">Original Image</h3>
                <div className="bg-white rounded-lg overflow-hidden flex items-center justify-center">
                  <img 
                    src={originalImage} 
                    alt="Original" 
                    className="w-full h-full object-contain"
                  />
                </div>
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
