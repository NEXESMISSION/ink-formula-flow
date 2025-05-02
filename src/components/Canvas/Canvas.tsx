
import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, PencilBrush } from "fabric";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { Editor } from "iink-ts";

export type CanvasMode = "pen" | "eraser";

interface CanvasProps {
  onExpressionUpdate?: (expression: string) => void;
}

export const Canvas = ({ onExpressionUpdate }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const inkEditorRef = useRef<Editor | null>(null);
  const [mode, setMode] = useState<CanvasMode>("pen");
  const { toast: uiToast } = useToast();
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [eraserSize, setEraserSize] = useState(10);
  
  // Show eraser cursor
  const cursorRef = useRef<HTMLDivElement | null>(null);
  
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

    // Create eraser cursor element
    const cursor = document.createElement('div');
    cursor.className = 'eraser-cursor';
    cursor.style.position = 'absolute';
    cursor.style.borderRadius = '50%';
    cursor.style.border = '2px solid red';
    cursor.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
    cursor.style.pointerEvents = 'none';
    cursor.style.transform = 'translate(-50%, -50%)';
    cursor.style.display = 'none';
    cursor.style.zIndex = '1000';
    document.body.appendChild(cursor);
    cursorRef.current = cursor;

    // Track mouse movement for eraser cursor
    const mouseMoveHandler = (e: MouseEvent) => {
      if (mode === 'eraser' && cursorRef.current) {
        cursorRef.current.style.display = 'block';
        cursorRef.current.style.width = `${eraserSize}px`;
        cursorRef.current.style.height = `${eraserSize}px`;
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      } else if (cursorRef.current) {
        cursorRef.current.style.display = 'none';
      }
    };

    // Add mouse move event listener
    canvasRef.current.addEventListener('mousemove', mouseMoveHandler);

    // Save to localStorage to persist between refreshes
    const savedStrokes = localStorage.getItem("inkFormula_drawing");
    if (savedStrokes) {
      try {
        canvas.loadFromJSON(savedStrokes, () => {
          canvas.renderAll();
          toast.success("Drawing restored from previous session");
        });
      } catch (error) {
        console.error("Error loading saved drawing:", error);
      }
    }

    // Clean up
    return () => {
      canvas.dispose();
      if (inkEditorRef.current) {
        // Clean up the editor - using close method instead of destroy
        try {
          inkEditorRef.current.close();
        } catch (e) {
          console.error("Error cleaning up MyScript editor:", e);
        }
      }
      
      // Remove eraser cursor
      if (cursorRef.current) {
        document.body.removeChild(cursorRef.current);
      }
      
      // Remove event listener
      canvasRef.current?.removeEventListener('mousemove', mouseMoveHandler);
    };
  }, []);

  // Update eraser size effect
  useEffect(() => {
    if (mode === 'eraser' && fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;
      canvas.freeDrawingBrush = new PencilBrush(canvas);
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.width = eraserSize;
        canvas.freeDrawingBrush.color = "#FFFFFF"; // White color to simulate eraser
      }
    }
  }, [eraserSize]);

  const initializeInkEditor = async () => {
    try {
      if (!editorRef.current) {
        console.error("Editor reference not found");
        return;
      }
      
      // Initialize MyScript iink editor with correct configuration
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

      // Store editor reference
      inkEditorRef.current = editor;
      console.log("MyScript iink editor initialized successfully");
    } catch (error) {
      console.error("Error initializing MyScript iink editor:", error);
      toast.error("Error initializing recognition service");
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
        canvas.freeDrawingBrush.width = eraserSize;
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
      uiToast({
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
      
      // For the MyScript recognition, convert our canvas strokes to their format
      const strokes = convertFabricToInkStrokes(canvas);
      
      if (strokes.length === 0) {
        uiToast({
          title: "No Drawing Detected",
          description: "Please draw something first.",
        });
        setIsRecognizing(false);
        return;
      }
      
      // Try to use MyScript iink for recognition
      try {
        const editor = inkEditorRef.current;
        
        // Use the correct method to export as LaTeX
        // Fixed: using export instead of export_
        const result = await editor.export({
          mimeType: 'application/x-latex'
        });
        
        if (result && onExpressionUpdate) {
          onExpressionUpdate(result);
          uiToast({
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
          uiToast({
            title: "Using Placeholder Recognition",
            description: "Recognition service error. Using placeholder formula.",
          });
        }
      }
    } catch (error) {
      console.error("Error during recognition process:", error);
      uiToast({
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
      toast.info("Canvas cleared");
    }
  };

  return {
    canvasRef,
    editorRef,
    mode,
    setMode,
    recognizeExpression,
    clearCanvas,
    isRecognizing,
    eraserSize,
    setEraserSize
  };
};
