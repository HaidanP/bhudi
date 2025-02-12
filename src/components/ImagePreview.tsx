
import { Canvas } from "./Canvas";

interface ImagePreviewProps {
  onCanvasReady: (canvas: fabric.Canvas) => void;
  width: number;
  height: number;
  brushSize: number;  // Add this prop
}

export const ImagePreview = ({ onCanvasReady, width, height, brushSize }: ImagePreviewProps) => {
  return (
    <div className="w-full flex-1">
      <h3 className="text-base font-medium text-gray-300 mb-3">Draw on the areas to edit</h3>
      <div className="bg-black/80 rounded-xl overflow-hidden shadow-lg border border-white/10">
        <Canvas 
          onCanvasReady={onCanvasReady}
          width={width}
          height={height}
          brushSize={brushSize}
        />
      </div>
    </div>
  );
};
