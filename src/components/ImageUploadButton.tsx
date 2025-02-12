
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
        className="gap-3 w-full md:w-auto h-12 px-6 text-base font-medium border-rose-800/50 hover:bg-rose-800/10 hover:text-rose-600 text-rose-700" 
        onClick={() => document.getElementById('image-upload')?.click()}
      >
        <Upload size={20} />
        Upload Image
      </Button>
    </>
  );
};
