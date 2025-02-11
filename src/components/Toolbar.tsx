
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Upload } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ToolbarProps {
  onImageUpload: (file: File) => void;
  brushSize: number;
  onBrushSizeChange: (value: number) => void;
  onClear: () => void;
}

export const Toolbar = ({
  onImageUpload,
  brushSize,
  onBrushSizeChange,
  onClear,
}: ToolbarProps) => {
  const isMobile = useIsMobile();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleUploadClick = () => {
    document.getElementById('image-upload')?.click();
  };

  return (
    <div className={`flex ${isMobile ? 'flex-col' : 'items-center'} gap-4 p-4 bg-white rounded-lg shadow-sm`}>
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="image-upload"
        />
        <Button variant="outline" className="gap-2 w-full md:w-auto" onClick={handleUploadClick}>
          <Upload size={16} />
          Upload Image
        </Button>
      </div>

      <div className={`flex ${isMobile ? 'flex-col' : 'items-center'} gap-4 flex-1`}>
        <Label htmlFor="brush-size" className="min-w-24">
          Brush Size: {brushSize}px
        </Label>
        <Slider
          id="brush-size"
          min={1}
          max={50}
          step={1}
          value={[brushSize]}
          onValueChange={(value) => onBrushSizeChange(value[0])}
          className="max-w-48"
        />
      </div>

      <Button variant="outline" onClick={onClear} className="w-full md:w-auto">
        Clear Mask
      </Button>
    </div>
  );
};
