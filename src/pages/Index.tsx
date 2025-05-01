
import React, { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DrawingTools } from "@/components/Canvas/DrawingTools";
import { Canvas, CanvasMode } from "@/components/Canvas/Canvas";
import { OutputDisplay } from "@/components/OutputDisplay";

const Index = () => {
  const [recognizedExpression, setRecognizedExpression] = useState("");
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<CanvasMode>("pen");
  
  const { 
    canvasRef: canvasRefFromHook, 
    mode: canvasMode, 
    setMode: setCanvasMode, 
    recognizeExpression, 
    clearCanvas 
  } = Canvas({ 
    onExpressionUpdate: setRecognizedExpression 
  });
  
  // Sync refs and state
  React.useEffect(() => {
    if (canvasRef.current && canvasRefFromHook) {
      canvasRef.current = canvasRefFromHook.current;
    }
    if (canvasMode !== mode) {
      setMode(canvasMode);
    }
  }, [canvasRefFromHook, canvasMode, mode]);
  
  // Handle mode change
  const handleModeChange = (newMode: CanvasMode) => {
    setMode(newMode);
    setCanvasMode(newMode);
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
                onRecognize={recognizeExpression}
                onClear={clearCanvas}
              />
              <div 
                ref={canvasContainerRef}
                className="bg-white border-t border-gray-200 relative overflow-hidden"
              >
                <canvas ref={canvasRefFromHook} className="block w-full h-[400px]" />
                <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded-full">
                  Draw your expression here
                </div>
              </div>
            </CardContent>
          </Card>

          <OutputDisplay expression={recognizedExpression} />
          
          <div className="text-center text-sm text-gray-500 mt-4">
            <p>
              Currently using placeholder recognition. API integration coming soon.
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
