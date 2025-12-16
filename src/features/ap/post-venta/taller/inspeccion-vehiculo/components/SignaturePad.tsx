import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eraser, Pen } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignaturePadProps {
  value?: string | null;
  onChange: (signature: string | null) => void;
  label: string;
  disabled?: boolean;
  required?: boolean;
}

export const SignaturePad = ({
  value,
  onChange,
  label,
  disabled = false,
  required = false,
}: SignaturePadProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Configurar el tamaño real del canvas para evitar desfases
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Si hay un valor previo (base64), cargarlo
    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setIsEmpty(false);
      };
      img.src = value;
    }

    // Configuración inicial del canvas
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [value]);

  const getCoordinates = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getCoordinates(e.clientX, e.clientY);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getCoordinates(e.clientX, e.clientY);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setIsEmpty(false);

    // Convertir canvas a base64 y notificar el cambio
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL("image/png");
      onChange(dataUrl);
    }
  };

  // Soporte para touch (tablets y móviles)
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    e.preventDefault();
    setIsDrawing(true);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const touch = e.touches[0];
    const { x, y } = getCoordinates(touch.clientX, touch.clientY);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const touch = e.touches[0];
    const { x, y } = getCoordinates(touch.clientX, touch.clientY);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleTouchEnd = () => {
    stopDrawing();
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
        <div className="flex gap-2">
          {!isEmpty && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearSignature}
              disabled={disabled}
              className="h-8"
            >
              <Eraser className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg overflow-hidden bg-white",
          disabled ? "opacity-60 cursor-not-allowed" : "cursor-crosshair",
          isEmpty && !disabled && "border-muted-foreground/25",
          !isEmpty && "border-primary/50"
        )}
        style={{ height: "400px" }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            touchAction: "none",
          }}
        />
        {isEmpty && !disabled && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Pen className="h-8 w-8" />
              <p className="text-sm">Firme aquí</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
