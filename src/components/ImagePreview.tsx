
import { Canvas } from "./Canvas";

interface ImagePreviewProps {
  onCanvasReady: (canvas: fabric.Canvas) => void;
  width: number;
  height: number;
  brushSize: number;
}

export const ImagePreview = ({ onCanvasReady, width, height, brushSize }: ImagePreviewProps) => {
  return (
    <div className="w-full flex-1">
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
