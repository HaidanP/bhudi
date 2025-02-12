
import { Button } from "./ui/button";
import { Slider } from "./ui/button";
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
    <div className="flex items-center gap-4 p-3 bg-white/50 backdrop-blur-sm rounded-lg shadow-sm">
      <div className="flex gap-2">
        <Button
          variant={activeTool === "brush" ? "default" : "outline"}
          size="icon"
          onClick={() => onToolChange("brush")}
          className="h-9 w-9"
        >
          <Brush className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTool === "eraser" ? "default" : "outline"}
          size="icon"
          onClick={() => onToolChange("eraser")}
          className="h-9 w-9"
        >
          <Eraser className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-3 min-w-[200px]">
        <span className="text-sm font-medium whitespace-nowrap">Size: {brushSize}px</span>
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
