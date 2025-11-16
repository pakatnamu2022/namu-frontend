"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUp, X } from "lucide-react";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface FileFormProps {
  label?: string;
  accept?: string;
  multiple?: boolean;
  value?: File | File[] | null;
  onChange: (files: File | File[] | null) => void;
  className?: string;
  disabled?: boolean;
}

export function FileForm({
  label = "Archivo",
  accept = ".xlsx,.xls,.csv",
  multiple = false,
  value,
  onChange,
  className,
  disabled = false,
}: FileFormProps) {
  const files = multiple
    ? Array.isArray(value)
      ? value
      : []
    : value
    ? [value as File]
    : [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    if (multiple) {
      const filesArray = Array.from(fileList);
      onChange(filesArray);
    } else {
      const file = fileList[0];
      onChange(file);
    }
  };

  const handleRemoveFile = (index: number) => {
    if (multiple) {
      const newFiles = files.filter((_, i) => i !== index);
      onChange(newFiles.length > 0 ? newFiles : null);
    } else {
      onChange(null);
    }
  };

  const handleRemoveAll = () => {
    onChange(null);
  };

  return (
    <FormItem className={className}>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <div className="space-y-2">
          {files.length === 0 ? (
            <div className="relative">
              <Input
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleFileChange}
                className="pl-10"
                disabled={disabled}
              />
              <FileUp className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-2 p-3 bg-muted rounded-lg"
                >
                  <FileUp className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="flex-1 text-sm font-medium truncate">
                    {file.name}
                  </span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {(file.size / 1024).toFixed(2)} KB
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(index)}
                    className="h-6 w-6 p-0 flex-shrink-0"
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {multiple && files.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveAll}
                  className="w-full"
                  disabled={disabled}
                >
                  Remover todos los archivos
                </Button>
              )}
            </div>
          )}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
