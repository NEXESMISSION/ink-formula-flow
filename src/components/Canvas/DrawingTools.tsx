
import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CanvasMode } from "./Canvas";
import { Eraser, Pen, RotateCcw, Sigma, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";

interface DrawingToolsProps {
  mode: CanvasMode;
  onModeChange: (mode: CanvasMode) => void;
  onRecognize: () => void;
  onClear: () => void;
  isProcessing?: boolean;
  eraserSize?: number;
  onEraserSizeChange?: (size: number) => void;
}

export const DrawingTools: React.FC<DrawingToolsProps> = ({
  mode,
  onModeChange,
  onRecognize,
  onClear,
  isProcessing = false,
  eraserSize = 10,
  onEraserSizeChange
}) => {
  return (
    <div className="flex flex-col gap-2 mb-2 p-2 bg-white border rounded-md shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onModeChange("pen")}
                  className={cn(
                    "h-9 w-9",
                    mode === "pen" && "bg-blue-700 text-white hover:bg-blue-800"
                  )}
                  disabled={isProcessing}
                >
                  <Pen className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Pen Tool</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onModeChange("eraser")}
                  className={cn(
                    "h-9 w-9",
                    mode === "eraser" && "bg-blue-700 text-white hover:bg-blue-800"
                  )}
                  disabled={isProcessing}
                >
                  <Eraser className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Eraser Tool</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Separator orientation="vertical" className="h-8 mx-1" />
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClear}
                  className="h-9 w-9"
                  disabled={isProcessing}
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear Canvas</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Button
          onClick={onRecognize}
          variant="default"
          className="bg-blue-700 hover:bg-blue-800"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Sigma className="h-4 w-4 mr-2" />
              Recognize Expression
            </>
          )}
        </Button>
      </div>
      
      {/* Eraser Size Slider - only show when eraser is selected */}
      {mode === "eraser" && onEraserSizeChange && (
        <div className="flex items-center gap-2 pt-2">
          <span className="text-xs text-gray-500 w-16">Eraser Size:</span>
          <Slider
            value={[eraserSize]}
            min={5}
            max={30}
            step={1}
            onValueChange={(value) => onEraserSizeChange(value[0])}
            className="flex-1"
          />
          <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{eraserSize}px</span>
        </div>
      )}
    </div>
  );
};
