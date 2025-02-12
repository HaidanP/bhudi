
import { useEffect, useRef } from "react";
import { fabric } from "fabric";

interface CanvasProps {
  onCanvasReady: (canvas: fabric.Canvas) => void;
  width: number;
  height: number;
  brushSize: number;
}

export const Canvas = ({ onCanvasReady, width, height, brushSize }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !width || !height) return;

    // Calculate scaled dimensions to fit within viewport
    const maxWidth = Math.min(width, window.innerWidth - 32);
    const scale = maxWidth / width;
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;

    // Initialize Fabric canvas with correct dimensions
    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      width: scaledWidth,
      height: scaledHeight,
      backgroundColor: 'transparent',
      enableRetinaScaling: false,
      fireRightClick: true,
      stopContextMenu: true,
      allowTouchScrolling: false
    });

    // Configure the brush
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.width = brushSize;
    canvas.freeDrawingBrush.color = "white";

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
  }, [width, height]); // Added width and height to dependencies

  // Update brush size when it changes
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.freeDrawingBrush.width = brushSize;
    }
  }, [brushSize]);

  return (
    <div className="canvas-container bg-transparent rounded-lg overflow-hidden flex items-center justify-center w-full">
      <canvas ref={canvasRef} className="max-w-full h-auto" />
    </div>
  );
};
