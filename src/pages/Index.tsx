
import React, { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DrawingTools } from "@/components/Canvas/DrawingTools";
import { Canvas, CanvasMode } from "@/components/Canvas/Canvas";
import { OutputDisplay } from "@/components/OutputDisplay";

const Index = () => {
  const [recognizedExpression, setRecognizedExpression] = useState("");
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<CanvasMode>("pen");
  const [isProcessing, setIsProcessing] = useState(false);
  const [eraserSize, setEraserSize] = useState(10);
  
  const { 
    canvasRef: canvasRefFromHook, 
    editorRef: editorRefFromHook,
    mode: canvasMode, 
    setMode: setCanvasMode, 
    recognizeExpression, 
    clearCanvas,
    isRecognizing,
    eraserSize: hookEraserSize,
    setEraserSize: setHookEraserSize
  } = Canvas({ 
    onExpressionUpdate: setRecognizedExpression 
  });
  
  // Sync refs and state
  React.useEffect(() => {
    if (canvasRef.current && canvasRefFromHook) {
      canvasRef.current = canvasRefFromHook.current;
    }
    if (editorRef.current && editorRefFromHook) {
      editorRef.current = editorRefFromHook.current;
    }
    if (canvasMode !== mode) {
      setMode(canvasMode);
    }
    if (hookEraserSize !== eraserSize) {
      setEraserSize(hookEraserSize || 10);
    }
    setIsProcessing(isRecognizing || false);
  }, [canvasRefFromHook, editorRefFromHook, canvasMode, mode, isRecognizing, hookEraserSize, eraserSize]);
  
  // Handle mode change
  const handleModeChange = (newMode: CanvasMode) => {
    setMode(newMode);
    setCanvasMode(newMode);
  };
  
  // Handle recognition
  const handleRecognize = () => {
    if (!isProcessing) {
      recognizeExpression();
    }
  };

  // Handle eraser size change
  const handleEraserSizeChange = (size: number) => {
    setEraserSize(size);
    if (setHookEraserSize) {
      setHookEraserSize(size);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-2">
            InkFormula
          </h1>
          <p className="text-gray-600">
            Draw mathematical expressions and convert them to LaTeX
          </p>
        </header>

        <div className="grid gap-6">
          <Card className="overflow-hidden border-2 border-gray-200 shadow-md">
            <CardContent className="p-0">
              <DrawingTools 
                mode={mode}
                onModeChange={handleModeChange}
                onRecognize={handleRecognize}
                onClear={clearCanvas}
                isProcessing={isProcessing}
                eraserSize={eraserSize}
                onEraserSizeChange={handleEraserSizeChange}
              />
              <div 
                ref={canvasContainerRef}
                className="bg-white border-t border-gray-200 relative overflow-hidden"
              >
                <canvas ref={canvasRefFromHook} className="block w-full h-[400px]" />
                <div ref={editorRefFromHook} className="hidden" style={{ width: '800px', height: '400px', touchAction: 'none' }} />
                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
                  </div>
                )}
                <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded-full">
                  Draw your expression here
                </div>
              </div>
            </CardContent>
          </Card>

          <OutputDisplay expression={recognizedExpression} />
          
          <div className="text-center text-sm text-gray-500 mt-4">
            <p>
              Powered by MyScript iink Technology for mathematical expression recognition.
            </p>
            <p className="mt-1">
              Try drawing standard mathematical symbols, operators, and structures.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
