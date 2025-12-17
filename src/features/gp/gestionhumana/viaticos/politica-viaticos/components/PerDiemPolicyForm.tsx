"use client";

import { useForm } from "react-hook-form";
import {
  PerDiemPolicySchema,
  PerDiemPolicySchemaUpdate,
  perDiemPolicySchemaCreate,
  perDiemPolicySchemaUpdate,
} from "../lib/perDiemPolicy.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader, FileText, Upload } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";

interface PerDiemPolicyFormProps {
  defaultValues: Partial<PerDiemPolicySchema | PerDiemPolicySchemaUpdate>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
  existingDocumentPath?: string;
}

export const PerDiemPolicyForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
  existingDocumentPath,
}: PerDiemPolicyFormProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<PerDiemPolicySchema | PerDiemPolicySchemaUpdate>({
    resolver: zodResolver(
      mode === "create" ? perDiemPolicySchemaCreate : perDiemPolicySchemaUpdate
    ) as any,
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="version"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Versión</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: 1.0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Política de Viáticos 2024"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DatePickerFormField
            control={form.control}
            name="effective_from"
            label="Fecha de Inicio"
            placeholder="Selecciona una fecha"
            dateFormat="dd/MM/yyyy"
            captionLayout="dropdown"
          />

          <DatePickerFormField
            control={form.control}
            name="effective_to"
            label="Fecha de Fin"
            placeholder="Selecciona una fecha"
            dateFormat="dd/MM/yyyy"
            captionLayout="dropdown"
          />
        </div>

        <FormField
          control={form.control}
          name="is_current"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Política Actual</FormLabel>
                <FormDescription>
                  Marcar si esta es la política vigente actual
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="document"
          render={({ field: { onChange, ...field } }) => (
            <FormItem>
              <FormLabel>
                Documento PDF {mode === "update" && "(Opcional)"}
              </FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                          onChange(file);
                        }
                      }}
                      className="pl-10"
                      {...field}
                      value={undefined}
                    />
                    <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {selectedFile && (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm">{selectedFile.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  )}
                  {!selectedFile &&
                    existingDocumentPath &&
                    mode === "update" && (
                      <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm">Documento existente</span>
                        <a
                          href={existingDocumentPath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary ml-auto hover:underline"
                        >
                          Ver documento
                        </a>
                      </div>
                    )}
                </div>
              </FormControl>
              <FormDescription>
                Tamaño máximo: 5MB. Solo archivos PDF.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observaciones o notas adicionales sobre esta política..."
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 w-full justify-end pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 animate-spin ${
                !isSubmitting ? "hidden" : ""
              }`}
            />
            {isSubmitting ? "Guardando..." : "Guardar Política"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
