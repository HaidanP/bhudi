
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
        className="gap-2 w-full md:w-auto min-h-[48px] px-6 text-lg font-semibold bg-gray-900 text-white hover:bg-gray-800 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 active:scale-95 min-w-[200px] flex items-center justify-center" 
        onClick={() => document.getElementById('image-upload')?.click()}
      >
        <Upload size={20} className="animate-bounce" />
        Upload Image
      </Button>
    </>
  );
};
