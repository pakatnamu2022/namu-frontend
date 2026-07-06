"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FileForm } from "@/shared/components/FileForm";
import { errorToast, promiseToast } from "@/core/core.function";
import { matchExcelModelsVn } from "../lib/modelsVn.actions";
import GeneralSheet from "@/shared/components/GeneralSheet";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface FormValues {
  file: File | null;
}

export default function ModelsVnMatchExcelDialog({ open, onClose }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({ defaultValues: { file: null } });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = async (values: FormValues) => {
    if (!values.file) {
      errorToast("Selecciona un archivo para cotejar");
      return;
    }
    setIsLoading(true);
    const request = matchExcelModelsVn(values.file);
    promiseToast(request, {
      loading: "Cotejando archivo...",
      success: "Archivo cotejado y descargado exitosamente",
      error: "Error al cotejar el archivo",
    });
    try {
      await request;
      handleClose();
    } catch {
      // error shown by promiseToast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GeneralSheet
      open={open}
      onClose={handleClose}
      title="Cotejar Modelos VN"
      icon="FileSearch2"
      size="lg"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Sube el Excel a cotejar (.xlsx, .xls) con las columnas Versión,
            Año Modelo y Combustible. Se descargará el mismo Excel con el
            resultado del cotejo agregado. Máx. 10 MB.
          </p>
          <FormField
            control={form.control}
            name="file"
            render={({ field: { onChange, value } }) => (
              <FileForm
                label="Archivo Excel"
                accept=".xlsx,.xls"
                multiple={false}
                value={value}
                onChange={onChange}
                disabled={isLoading}
              />
            )}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || !form.watch("file")}
            >
              {isLoading ? "Cotejando..." : "Cotejar"}
            </Button>
          </div>
        </form>
      </Form>
    </GeneralSheet>
  );
}
