"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { PhotoUploadFieldProps } from "../lib/supplyControl.interface";

export function PhotoUploadField({
    label,
    value,
    onChange,
    className,
    disabled = false,
    required = false,
    placeholder = "Tomar foto o subir de galería",
    description,
    accept = "image/*",
    maxSize = 5,
}: PhotoUploadFieldProps) {
    const [preview, setPreview] = useState<string | null>(value || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > maxSize * 1024 * 1024) {
            alert(`El archivo es demasiado grande. Máximo ${maxSize}MB`);
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setPreview(base64);
            onChange(base64);
        };
        reader.readAsDataURL(file);
    };

    const handleClear = () => {
        setPreview(null);
        onChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleCapture = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.capture = "environment";
        input.onchange = (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (files && files.length > 0) {
                const file = files[0];
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = reader.result as string;
                    setPreview(base64);
                    onChange(base64);
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    return (
        <div className={cn("space-y-2", className)}>
            <Label className="flex items-center gap-1">
                {label}
                {required && <span className="text-destructive">*</span>}
            </Label>

            {preview ? (
                <div className="relative rounded-lg border overflow-hidden">
                    <img
                        src={preview}
                        alt={label}
                        className="w-full max-h-[200px] object-contain bg-muted/30"
                    />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7"
                        onClick={handleClear}
                        disabled={disabled}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2 flex-wrap">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-2 flex-1 min-w-[120px]"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={disabled}
                        >
                            <Upload className="h-4 w-4" />
                            Subir de galería
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-2 flex-1 min-w-[120px]"
                            onClick={handleCapture}
                            disabled={disabled}
                        >
                            <Camera className="h-4 w-4" />
                            Tomar foto
                        </Button>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={accept}
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={disabled}
                    />
                    {placeholder && (
                        <p className="text-xs text-muted-foreground">{placeholder}</p>
                    )}
                    {description && (
                        <p className="text-xs text-muted-foreground">{description}</p>
                    )}
                </div>
            )}
        </div>
    );
}