
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Brush, Eraser } from "lucide-react";

interface DrawingToolbarProps {
  activeTool: "brush" | "eraser";
  brushSize: number;
  onToolChange: (tool: "brush" | "eraser") => void;
  onBrushSizeChange: (size: number) => void;
}

export const DrawingToolbar = ({
  activeTool,
  brushSize,
  onToolChange,
  onBrushSizeChange,
}: DrawingToolbarProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 bg-black/60 backdrop-blur-2xl rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.25)] border border-white/10 w-full sm:w-auto transition-all duration-300 hover:shadow-[0_4px_24px_rgba(255,255,255,0.05)]">
      <div className="flex gap-3 w-full sm:w-auto justify-center">
        <Button
          variant={activeTool === "brush" ? "default" : "outline"}
          size="icon"
          onClick={() => onToolChange("brush")}
          className={`h-10 w-10 rounded-xl transition-all duration-300 transform hover:scale-[1.05] active:scale-[0.95] ${
            activeTool === "brush" 
              ? "bg-rose-600 hover:bg-rose-700 border-0 shadow-lg shadow-rose-500/20" 
              : "border-rose-800/50 hover:border-rose-800 text-rose-600 hover:bg-rose-950/30"
          }`}
        >
          <Brush className="h-5 w-5" />
        </Button>
        <Button
          variant={activeTool === "eraser" ? "default" : "outline"}
          size="icon"
          onClick={() => onToolChange("eraser")}
          className={`h-10 w-10 rounded-xl transition-all duration-300 transform hover:scale-[1.05] active:scale-[0.95] ${
            activeTool === "eraser" 
              ? "bg-rose-600 hover:bg-rose-700 border-0 shadow-lg shadow-rose-500/20" 
              : "border-rose-800/50 hover:border-rose-800 text-rose-600 hover:bg-rose-950/30"
          }`}
        >
          <Eraser className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex items-center gap-4 w-full sm:w-[200px]">
        <span className="text-sm font-medium text-gray-300 whitespace-nowrap min-w-[80px]">Size: {brushSize}px</span>
        <Slider
          value={[brushSize]}
          onValueChange={(value) => onBrushSizeChange(value[0])}
          min={1}
          max={100}
          step={1}
          className="w-full"
        />
      </div>
    </div>
  );
};
