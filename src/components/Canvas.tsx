
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

    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      width,
      height,
      // Enable touch events directly in the options
      enableRetinaScaling: true,
      fireRightClick: true,
      stopContextMenu: true,
      allowTouchScrolling: false // Set the option directly in the constructor
    });

    // Configure the brush for better cross-device compatibility
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.width = 20;
    canvas.freeDrawingBrush.color = "black";

    fabricCanvasRef.current = canvas;
    onCanvasReady(canvas);

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, []);

  // Handle dimension changes separately
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setDimensions({ width, height });
      fabricCanvasRef.current.renderAll();
    }
  }, [width, height]);

  return (
    <div className="canvas-container bg-white rounded-lg overflow-hidden flex items-center justify-center">
      <canvas ref={canvasRef} />
    </div>
  );
};
