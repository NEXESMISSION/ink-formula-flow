
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface OutputDisplayProps {
  expression: string;
}

export const OutputDisplay: React.FC<OutputDisplayProps> = ({ expression }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(expression);
      setCopied(true);
      toast.success("Copied to clipboard!");
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <CardTitle className="text-lg">Recognized Expression</CardTitle>
        {expression && (
          <Button 
            onClick={copyToClipboard}
            variant="outline"
            size="sm"
            className={copied ? "bg-green-100" : ""}
          >
            {copied ? "Copied!" : "Copy LaTeX"}
          </Button>
        )}
      </CardHeader>
      <CardContent className="bg-gray-50 rounded-md min-h-24">
        {expression ? (
          <div className="flex flex-col space-y-3">
            <div className="overflow-x-auto">
              <BlockMath math={expression} />
            </div>
            <div className="text-sm text-muted-foreground pt-2 border-t">
              <code className="text-xs bg-gray-100 p-1 rounded">{expression}</code>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-24 text-muted-foreground">
            Draw an expression and click "Recognize Expression"
          </div>
        )}
      </CardContent>
    </Card>
  );
};
