
import { useEffect, useRef } from "react";
import { fabric } from "fabric";

interface CanvasProps {
  onCanvasReady: (canvas: fabric.Canvas) => void;
  width: number;
  height: number;
}

export const Canvas = ({ onCanvasReady, width, height }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      width,
      height,
    });

    onCanvasReady(canvas);

    return () => {
      canvas.dispose();
    };
  }, [onCanvasReady, width, height]);

  return (
    <div className="canvas-container bg-white rounded-lg overflow-hidden flex items-center justify-center">
      <canvas ref={canvasRef} />
    </div>
  );
};
