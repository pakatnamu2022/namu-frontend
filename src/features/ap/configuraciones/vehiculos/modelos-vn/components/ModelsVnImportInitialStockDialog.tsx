"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Form, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FileForm } from "@/shared/components/FileForm";
import { errorToast } from "@/core/core.function";
import { importInitialStockModelsVn } from "../lib/modelsVn.actions";
import type { ImportInitialStockModelsVnResponse } from "../lib/modelsVn.interface";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { DataTable } from "@/shared/components/DataTable";
import { modelsVnImportInitialStockColumns } from "./ModelsVnImportInitialStockColumns";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormValues {
  file: File | null;
}

export default function ModelsVnImportInitialStockDialog({
  open,
  onClose,
  onSuccess,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImportInitialStockModelsVnResponse | null>(
    null
  );

  const form = useForm<FormValues>({ defaultValues: { file: null } });

  const handleClose = () => {
    form.reset();
    setResult(null);
    onClose();
  };

  const onSubmit = async (values: FormValues) => {
    if (!values.file) {
      errorToast("Selecciona un archivo para importar");
      return;
    }
    setIsLoading(true);
    try {
      const res = await importInitialStockModelsVn(values.file);
      setResult(res);
      if (res.created > 0) {
        onSuccess();
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Error al importar el stock inicial";
      errorToast(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GeneralSheet
      open={open}
      onClose={handleClose}
      title="Importar Stock Inicial"
      icon="PackagePlus"
      size="6xl"
    >
      {result ? (
        <div className="space-y-4">
          <div
            className={`flex items-start gap-3 rounded-lg p-3 ${
              result.errors === 0
                ? "bg-green-50 text-green-800"
                : "bg-amber-50 text-amber-800"
            }`}
          >
            {result.errors === 0 ? (
              <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 size-5 shrink-0" />
            )}
            <div>
              <p className="text-sm font-medium">
                {result.preview ? "Vista previa de importación" : "Importación completada"}
              </p>
              <p className="mt-1 text-xs">
                Creados: {result.created} · Errores: {result.errors} · Total
                filas: {result.rows.length}
              </p>
            </div>
          </div>

          {result.rows.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium">Detalle por fila</p>
              <DataTable
                columns={modelsVnImportInitialStockColumns}
                data={result.rows}
                isVisibleColumnFilter={false}
              />
            </div>
          )}

          <div className="flex justify-between gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setResult(null);
                form.reset();
              }}
            >
              Nueva importación
            </Button>
            <Button size="sm" onClick={handleClose}>
              Cerrar
            </Button>
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sube el template de Excel (.xlsx, .xls) con el stock inicial de
              los modelos. Máx. 10 MB.
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
                {isLoading ? "Importando..." : "Importar"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </GeneralSheet>
  );
}
