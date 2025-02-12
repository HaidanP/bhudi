
import { Button } from "./ui/button";
import { Upload } from "lucide-react";

interface ImageUploadButtonProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ImageUploadButton = ({ onFileChange }: ImageUploadButtonProps) => {
  return (
    <div className="container-width mt-14">
      <input
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="hidden"
        id="image-upload"
      />
      <div 
        className="group p-8 bg-white/[0.03] border-2 border-dashed border-[rgba(255,107,107,0.3)] hover:border-[#ff6b6b] rounded-2xl transition-all duration-300 cursor-pointer hover:scale-[1.01]"
        onClick={() => document.getElementById('image-upload')?.click()}
      >
        <div className="flex flex-col items-center gap-4">
          <Upload size={32} className="text-[#ff6b6b]" />
          <p className="text-[18px] font-medium tracking-[0.5px] text-white/90">
            Upload Image
          </p>
        </div>
      </div>
    </div>
  );
};
