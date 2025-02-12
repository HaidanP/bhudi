
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
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-black/60 backdrop-blur-md rounded-xl shadow-lg border border-white/10 w-full sm:w-auto">
      <div className="flex gap-2 w-full sm:w-auto justify-center">
        <Button
          variant={activeTool === "brush" ? "default" : "outline"}
          size="icon"
          onClick={() => onToolChange("brush")}
          className={`h-10 w-10 rounded-lg ${
            activeTool === "brush" 
              ? "bg-rose-800 hover:bg-rose-900 border-0" 
              : "border-rose-800/50 hover:border-rose-800 text-rose-700"
          }`}
        >
          <Brush className="h-5 w-5" />
        </Button>
        <Button
          variant={activeTool === "eraser" ? "default" : "outline"}
          size="icon"
          onClick={() => onToolChange("eraser")}
          className={`h-10 w-10 rounded-lg ${
            activeTool === "eraser" 
              ? "bg-rose-800 hover:bg-rose-900 border-0" 
              : "border-rose-800/50 hover:border-rose-800 text-rose-700"
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
          max={50}
          step={1}
          className="w-full"
        />
      </div>
    </div>
  );
};
