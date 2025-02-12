
import { Button } from "./ui/button";
import { RefreshCw } from "lucide-react";

interface GeneratedResultProps {
  imageUrl: string;
  onReset?: () => void;
}

export const GeneratedResult = ({ imageUrl, onReset }: GeneratedResultProps) => {
  return (
    <div className="w-full flex-1">
      <h3 className="text-base font-medium text-gray-300 mb-3">Generated Result</h3>
      <div className="bg-black/60 backdrop-blur-2xl rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/10 flex flex-col transition-all duration-300 hover:shadow-[0_8px_32px_rgba(255,255,255,0.1)]">
        <img 
          src={imageUrl} 
          alt="Generated" 
          className="w-full h-full object-contain transition-transform duration-500 hover:scale-[1.02]"
        />
        {onReset && (
          <div className="p-4 border-t border-white/10">
            <Button
              variant="outline"
              onClick={onReset}
              className="w-full border-rose-800/50 hover:bg-rose-950/30 hover:text-rose-500 text-rose-600 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <RefreshCw size={16} className="mr-2 animate-spin-slow" />
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
