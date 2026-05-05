import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

interface CopyCellProps {
  value: string;
  /** Texto que se muestra visualmente. Si se omite, muestra `value`. */
  label?: string;
  className?: string;
}

export function CopyCell({ value, label, className }: CopyCellProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <span className={className}>{label ?? value}</span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-5 w-5 p-0 hover:bg-slate-200"
        onClick={handleCopy}
        tooltip="copiar"
      >
        {copied ? (
          <Check className="h-3 w-3 text-green-600" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
}
