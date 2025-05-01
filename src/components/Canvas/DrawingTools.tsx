
import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CanvasMode } from "./Canvas";
import { Eraser, Pen, RotateCcw, Sigma } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DrawingToolsProps {
  mode: CanvasMode;
  onModeChange: (mode: CanvasMode) => void;
  onRecognize: () => void;
  onClear: () => void;
}

export const DrawingTools: React.FC<DrawingToolsProps> = ({
  mode,
  onModeChange,
  onRecognize,
  onClear,
}) => {
  return (
    <div className="flex items-center justify-between mb-2 p-2 bg-white border rounded-md shadow-sm">
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
                  mode === "pen" && "bg-inkformula-blue text-white hover:bg-inkformula-blue/90"
                )}
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
                  mode === "eraser" && "bg-inkformula-blue text-white hover:bg-inkformula-blue/90"
                )}
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
        className="bg-inkformula-blue hover:bg-inkformula-blue-dark"
      >
        <Sigma className="h-4 w-4 mr-2" />
        Recognize Expression
      </Button>
    </div>
  );
};
