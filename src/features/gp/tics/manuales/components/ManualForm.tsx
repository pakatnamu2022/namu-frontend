"use client";

import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/shared/components/FormInput";
import { FormTextArea } from "@/shared/components/FormTextArea";
import { useViews } from "@/features/gp/gestionsistema/vistas/lib/view.hook";
import {
  manualSchemaCreate,
  manualSchemaUpdate,
  ManualSchemaCreate,
  ManualSchemaUpdate,
} from "../lib/manual.schema";
import { FileText } from "lucide-react";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";

interface ManualFormProps {
  defaultValues: Partial<ManualSchemaCreate>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
  existingFileUrl?: string | null;
}

export function ManualForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
  existingFileUrl,
}: ManualFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ManualSchemaCreate | ManualSchemaUpdate>({
    resolver: zodResolver(
      mode === "create" ? manualSchemaCreate : manualSchemaUpdate,
    ) as any,
    defaultValues: {
      vista_id: defaultValues.vista_id ?? undefined,
      title: defaultValues.title ?? "",
      description: defaultValues.description ?? "",
      order: defaultValues.order ?? 0,
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 gap-4">
          <FormSelectAsync
            control={form.control}
            name="vista_id"
            label="Vista / Módulo"
            placeholder="Selecciona una vista"
            useQueryHook={useViews}
            mapOptionFn={(option) => ({
              label: option.descripcion,
              description: option.company ?? undefined,
              value: String(option.id),
            })}
            required
          />

          <FormInput
            control={form.control}
            name="title"
            label="Título"
            placeholder="Ej: Guía de uso de vacaciones"
            required
          />

          <FormTextArea
            control={form.control}
            name="description"
            label="Descripción"
            placeholder="Descripción breve del manual (opcional)"
            rows={2}
          />

          <FormInput
            control={form.control}
            name="order"
            label="Orden"
            type="number"
            placeholder="0"
          />

          {/* File input */}
          <FormField
            control={form.control}
            name="file"
            render={({ field: { onChange } }) => (
              <FormItem>
                <FormLabel className="text-xs md:text-sm">
                  Archivo Markdown (.md)
                  {mode === "create" && (
                    <span className="ml-1 text-destructive">*</span>
                  )}
                </FormLabel>
                {existingFileUrl && (
                  <p className="text-xs text-muted-foreground">
                    Actual:{" "}
                    <a
                      href={existingFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline-offset-2 hover:underline"
                    >
                      ver archivo
                    </a>
                    {mode === "update" && " — sube uno nuevo para reemplazarlo"}
                  </p>
                )}
                <FormControl>
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-muted-foreground shrink-0" />
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".md,text/markdown,text/plain"
                      className="cursor-pointer"
                      onChange={(e) =>
                        onChange(e.target.files?.[0] ?? undefined)
                      }
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            {isSubmitting ? "Guardando..." : "Guardar manual"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
