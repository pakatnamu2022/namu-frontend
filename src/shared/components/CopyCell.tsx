import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { infoToast } from "@/core/core.function";

interface CopyCellProps {
  value: string;
  /** Texto que se muestra visualmente. Si se omite, muestra `value`. */
  label?: string;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
  font?: "normal" | "mono";
}

export function CopyCell({
  value,
  label,
  className,
  size = "sm",
  font,
}: CopyCellProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      infoToast(value, "Copiado al portapapeles");
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };

  const sizeClass = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }[size || "md"];

  const fontClass = {
    normal: "font-normal",
    mono: "font-mono",
  }[font || "normal"];

  return (
    <div className="flex items-center gap-1">
      <span className={cn(sizeClass, fontClass, className)}>
        {label ?? value}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-5 w-5 p-0 hover:bg-slate-200"
        onClick={handleCopy}
        tooltip="Copiar"
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
