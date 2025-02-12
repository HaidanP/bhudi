
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
    <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-purple-100">
      <div className="flex gap-2">
        <Button
          variant={activeTool === "brush" ? "default" : "outline"}
          size="icon"
          onClick={() => onToolChange("brush")}
          className={`h-10 w-10 rounded-lg ${
            activeTool === "brush" 
              ? "bg-purple-500 hover:bg-purple-600" 
              : "hover:border-purple-500 hover:text-purple-500"
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
              ? "bg-purple-500 hover:bg-purple-600" 
              : "hover:border-purple-500 hover:text-purple-500"
          }`}
        >
          <Eraser className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex items-center gap-4 min-w-[200px]">
        <span className="text-sm font-medium text-slate-700 whitespace-nowrap">Size: {brushSize}px</span>
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
