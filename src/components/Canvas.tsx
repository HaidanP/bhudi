
import { useEffect, useRef } from "react";
import { fabric } from "fabric";

interface CanvasProps {
  onCanvasReady: (canvas: fabric.Canvas) => void;
  width: number;
  height: number;
}

export const Canvas = ({ onCanvasReady, width, height }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Calculate scaled dimensions to fit within viewport
    const maxWidth = Math.min(width, window.innerWidth - 32); // 32px for padding
    const scale = maxWidth / width;
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;

    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      width: scaledWidth,
      height: scaledHeight,
      // Enable touch events directly in the options
      enableRetinaScaling: true,
      fireRightClick: true,
      stopContextMenu: true,
      allowTouchScrolling: false
    });

    // Configure the brush for better cross-device compatibility
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.width = 20 * scale; // Scale brush size proportionally
    canvas.freeDrawingBrush.color = "black";

    fabricCanvasRef.current = canvas;
    onCanvasReady(canvas);

    // Handle window resize
    const handleResize = () => {
      if (!fabricCanvasRef.current) return;
      const newMaxWidth = Math.min(width, window.innerWidth - 32);
      const newScale = newMaxWidth / width;
      const newScaledWidth = width * newScale;
      const newScaledHeight = height * newScale;
      
      fabricCanvasRef.current.setDimensions({
        width: newScaledWidth,
        height: newScaledHeight
      });
      fabricCanvasRef.current.renderAll();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, []);

  // Handle dimension changes separately
  useEffect(() => {
    if (fabricCanvasRef.current) {
      const maxWidth = Math.min(width, window.innerWidth - 32);
      const scale = maxWidth / width;
      const scaledWidth = width * scale;
      const scaledHeight = height * scale;

      fabricCanvasRef.current.setDimensions({
        width: scaledWidth,
        height: scaledHeight
      });
      fabricCanvasRef.current.renderAll();
    }
  }, [width, height]);

  return (
    <div className="canvas-container bg-white rounded-lg overflow-hidden flex items-center justify-center w-full">
      <canvas ref={canvasRef} className="max-w-full h-auto" />
    </div>
  );
};
