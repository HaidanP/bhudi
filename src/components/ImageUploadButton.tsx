
import { Button } from "./ui/button";
import { Upload } from "lucide-react";

interface ImageUploadButtonProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ImageUploadButton = ({ onFileChange }: ImageUploadButtonProps) => {
  return (
    <>
      <input
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="hidden"
        id="image-upload"
      />
      <Button 
        variant="outline" 
        className="gap-3 w-full md:w-auto h-12 px-6 text-base font-medium border-rose-800/50 hover:bg-rose-950/30 hover:text-rose-500 text-rose-600 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]" 
        onClick={() => document.getElementById('image-upload')?.click()}
      >
        <Upload size={20} className="animate-bounce" />
        Upload Image
      </Button>
    </>
  );
};
