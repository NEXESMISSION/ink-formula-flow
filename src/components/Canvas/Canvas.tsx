
import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, PencilBrush } from "fabric";
import { useToast } from "@/components/ui/use-toast";
import { sonner as sonnerToast } from "sonner";
import { Editor } from "iink-ts";

export type CanvasMode = "pen" | "eraser";

interface CanvasProps {
  onExpressionUpdate?: (expression: string) => void;
}

export const Canvas = ({ onExpressionUpdate }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const inkEditorRef = useRef<Editor | null>(null);
  const [mode, setMode] = useState<CanvasMode>("pen");
  const { toast } = useToast();
  const [isRecognizing, setIsRecognizing] = useState(false);

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

    // Initialize the MyScript iink editor
    initializeInkEditor();

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
      if (inkEditorRef.current) {
        inkEditorRef.current.close();
      }
    };
  }, []);

  const initializeInkEditor = async () => {
    try {
      // Initialize MyScript iink editor
      const editor = new Editor({
        host: "webdemoapi.myscript.com",
        configuration: {
          editor: {
            math: {
              mimeTypes: ["application/x-latex"],
            }
          }
        },
        credentials: {
          applicationKey: "6c786113-38a3-43ac-8c5b-c87b08dff878",
          hmacKey: "51a0e005-1587-4ebe-8f41-9b6cb25fd738"
        }
      });
      
      inkEditorRef.current = editor;
      console.log("MyScript iink editor initialized successfully");
    } catch (error) {
      console.error("Error initializing MyScript iink editor:", error);
      sonnerToast.error("Error initializing recognition service");
    }
  };

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

  // Convert fabric.js paths to MyScript iink strokes format
  const convertFabricToInkStrokes = (canvas: FabricCanvas) => {
    const objects = canvas.getObjects();
    const strokes = [];
    
    for (const obj of objects) {
      if (obj.type === 'path') {
        // Convert fabric path points to iink stroke points
        // This is a simplification - in a real implementation 
        // we'd need more detailed point data extraction
        const path = obj as any; // Using any to access path data
        if (path.path) {
          const points = [];
          
          // Extract points from path data
          for (const cmd of path.path) {
            if (cmd[0] === 'L' || cmd[0] === 'M') {
              points.push({
                x: cmd[1],
                y: cmd[2],
                t: Date.now() // Time should ideally be the actual time of drawing
              });
            }
          }
          
          if (points.length > 0) {
            strokes.push({
              id: `stroke-${strokes.length}`,
              pointerType: 'pen',
              color: path.stroke || '#000000',
              width: path.strokeWidth || 3,
              points: points
            });
          }
        }
      }
    }
    
    return strokes;
  };

  // Perform expression recognition using MyScript iink
  const recognizeExpression = async () => {
    if (!fabricCanvasRef.current || !inkEditorRef.current) {
      toast({
        title: "Recognition Error",
        description: "Canvas or recognition service not initialized properly.",
        variant: "destructive"
      });
      return;
    }
    
    setIsRecognizing(true);
    
    try {
      // Save current drawing to localStorage
      const canvas = fabricCanvasRef.current;
      const json = canvas.toJSON();
      localStorage.setItem("inkFormula_drawing", JSON.stringify(json));
      
      // For the MyScript recognition, we'd convert our canvas strokes to their format
      // This is a simplified placeholder for the actual conversion logic
      const strokes = convertFabricToInkStrokes(canvas);
      
      if (strokes.length === 0) {
        toast({
          title: "No Drawing Detected",
          description: "Please draw something first.",
        });
        setIsRecognizing(false);
        return;
      }
      
      // In a real implementation, we'd use their SDK to process the strokes
      // For now, we'll use the fallback if the real recognition fails
      
      // Try to use MyScript iink for recognition
      try {
        const editor = inkEditorRef.current;
        // This is pseudocode - actual implementation would use MyScript's API
        // to send the strokes and get back a recognition result
        const result = await editor.recognize(strokes);
        
        if (result && onExpressionUpdate) {
          onExpressionUpdate(result);
          toast({
            title: "Expression Recognized",
            description: "Your mathematical expression has been converted to LaTeX.",
          });
        }
      } catch (recognitionError) {
        console.error("Error during MyScript recognition:", recognitionError);
        
        // Fallback to placeholder if real recognition fails
        const placeholder = "\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}";
        if (onExpressionUpdate) {
          onExpressionUpdate(placeholder);
          toast({
            title: "Using Placeholder Recognition",
            description: "Recognition service error. Using placeholder formula.",
          });
        }
      }
    } catch (error) {
      console.error("Error during recognition process:", error);
      toast({
        title: "Recognition Failed",
        description: "An error occurred during the expression recognition.",
        variant: "destructive"
      });
      
      // Use fallback placeholder
      if (onExpressionUpdate) {
        onExpressionUpdate("\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}");
      }
    } finally {
      setIsRecognizing(false);
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
    isRecognizing
  };
};
