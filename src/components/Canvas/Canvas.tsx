
import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, PencilBrush } from "fabric";
import { useToast } from "@/components/ui/use-toast";
import { toast as sonnerToast } from "sonner";

export type CanvasMode = "pen" | "eraser";

interface CanvasProps {
  onExpressionUpdate?: (expression: string) => void;
}

export const Canvas = ({ onExpressionUpdate }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const [mode, setMode] = useState<CanvasMode>("pen");
  const { toast } = useToast();

  // Initialize the canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    // Create a new fabric canvas
    const canvas = new FabricCanvas(canvasRef.current, {
      isDrawingMode: true,
      width: 800,
      height: 400,
      backgroundColor: "#FFFFFF",
    });

    // Configure the freeDrawingBrush after ensuring it's created
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = 3;
      canvas.freeDrawingBrush.color = "#000000";
    }

    // Store the canvas instance
    fabricCanvasRef.current = canvas;

    // Save to localStorage to persist between refreshes
    const savedStrokes = localStorage.getItem("inkFormula_drawing");
    if (savedStrokes) {
      try {
        canvas.loadFromJSON(savedStrokes, () => {
          canvas.renderAll();
          sonnerToast.success("Drawing restored from previous session");
        });
      } catch (error) {
        console.error("Error loading saved drawing:", error);
      }
    }

    // Clean up
    return () => {
      canvas.dispose();
    };
  }, []);

  // Update drawing mode
  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    
    if (mode === "pen") {
      canvas.freeDrawingBrush = new PencilBrush(canvas);
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.width = 3;
        canvas.freeDrawingBrush.color = "#000000";
      }
      canvas.isDrawingMode = true;
    } else if (mode === "eraser") {
      // Create a PencilBrush with white color to simulate eraser
      canvas.freeDrawingBrush = new PencilBrush(canvas);
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.width = 10;
        canvas.freeDrawingBrush.color = "#FFFFFF"; // Use white color to simulate eraser
      }
      canvas.isDrawingMode = true;
    }
  }, [mode]);

  // Perform stroke recognition (placeholder for now)
  const recognizeExpression = () => {
    // In the future, we'll integrate with a recognition API
    // For now, we'll just return a placeholder LaTeX string
    const placeholder = "\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}";
    
    if (onExpressionUpdate) {
      onExpressionUpdate(placeholder);
      toast({
        title: "Expression Recognized",
        description: "This is a placeholder. Recognition API integration coming soon.",
      });
    }
    
    // Save current drawing to localStorage
    if (fabricCanvasRef.current) {
      const json = fabricCanvasRef.current.toJSON();
      localStorage.setItem("inkFormula_drawing", JSON.stringify(json));
    }
  };

  // Clear the canvas
  const clearCanvas = () => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.clear();
      fabricCanvasRef.current.backgroundColor = "#FFFFFF";
      fabricCanvasRef.current.renderAll();
      
      if (onExpressionUpdate) {
        onExpressionUpdate("");
      }
      
      localStorage.removeItem("inkFormula_drawing");
      sonnerToast.info("Canvas cleared");
    }
  };

  return {
    canvasRef,
    mode,
    setMode,
    recognizeExpression,
    clearCanvas,
  };
};
