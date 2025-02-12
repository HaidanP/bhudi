
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
      <div className="bg-black/80 rounded-xl overflow-hidden shadow-lg border border-white/10 flex flex-col">
        <img 
          src={imageUrl} 
          alt="Generated" 
          className="w-full h-full object-contain"
        />
        {onReset && (
          <div className="p-4 border-t border-white/10">
            <Button
              variant="outline"
              onClick={onReset}
              className="w-full border-rose-800/50 hover:bg-rose-800/10 hover:text-rose-600 text-rose-700"
            >
              <RefreshCw size={16} className="mr-2" />
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
