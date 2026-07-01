"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Form, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FileForm } from "@/shared/components/FileForm";
import { errorToast } from "@/core/core.function";
import { verifyModelsVn } from "../lib/modelsVn.actions";
import type { VerifyModelsVnResponse } from "../lib/modelsVn.interface";
import GeneralSheet from "@/shared/components/GeneralSheet";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface FormValues {
  file: File | null;
}

export default function ModelsVnVerifyDialog({ open, onClose }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerifyModelsVnResponse | null>(null);

  const form = useForm<FormValues>({ defaultValues: { file: null } });

  const handleClose = () => {
    form.reset();
    setResult(null);
    onClose();
  };

  const onSubmit = async (values: FormValues) => {
    if (!values.file) {
      errorToast("Selecciona un archivo para verificar");
      return;
    }
    setIsLoading(true);
    try {
      const res = await verifyModelsVn(values.file);
      setResult(res);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Error al verificar el archivo";
      errorToast(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GeneralSheet
      open={open}
      onClose={handleClose}
      title="Verificar Modelos VN"
      icon="FileSearch"
      size="3xl"
    >
      {result ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-xs text-muted-foreground">Procesadas</p>
              <p className="text-2xl font-semibold">{result.rows_processed}</p>
            </div>
            <div className="rounded-lg bg-green-50 p-3 text-center">
              <p className="text-xs text-green-700">Encontradas</p>
              <p className="text-2xl font-semibold text-green-700">
                {result.existing_count}
              </p>
            </div>
            <div className="rounded-lg bg-red-50 p-3 text-center">
              <p className="text-xs text-red-700">No encontradas</p>
              <p className="text-2xl font-semibold text-red-700">
                {result.not_found_count}
              </p>
            </div>
          </div>

          {result.existing.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-green-600" />
                <p className="text-sm font-medium text-green-700">
                  Modelos encontrados ({result.existing_count})
                </p>
              </div>
              <div className="overflow-hidden rounded-md border">
                <table className="w-full text-xs">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Fila</th>
                      <th className="px-3 py-2 text-left font-medium">
                        Código
                      </th>
                      <th className="px-3 py-2 text-left font-medium">
                        Versión
                      </th>
                      <th className="px-3 py-2 text-left font-medium">Año</th>
                      <th className="px-3 py-2 text-left font-medium">
                        Combustible
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.existing.map((row, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-3 py-2">{row.fila}</td>
                        <td className="px-3 py-2 font-mono">{row.code}</td>
                        <td className="px-3 py-2">{row.version}</td>
                        <td className="px-3 py-2">{row.model_year}</td>
                        <td className="px-3 py-2">{row.fuel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {result.not_found.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-1.5">
                <XCircle className="size-4 text-red-500" />
                <p className="text-sm font-medium text-red-600">
                  Modelos no encontrados ({result.not_found_count})
                </p>
              </div>
              <div className="overflow-hidden rounded-md border">
                <table className="w-full text-xs">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Fila</th>
                      <th className="px-3 py-2 text-left font-medium">
                        Versión
                      </th>
                      <th className="px-3 py-2 text-left font-medium">Año</th>
                      <th className="px-3 py-2 text-left font-medium">
                        Combustible
                      </th>
                      <th className="px-3 py-2 text-left font-medium">
                        Motivo
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.not_found.map((row, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-3 py-2">{row.fila}</td>
                        <td className="px-3 py-2">{row.version}</td>
                        <td className="px-3 py-2">{row.model_year}</td>
                        <td className="px-3 py-2">{row.fuel}</td>
                        <td className="px-3 py-2 text-red-600">{row.motivo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
              Nueva verificación
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
              Sube el Excel de verificación (.xlsx, .xls) con las columnas
              Versión, Año y Combustible. Máx. 10 MB.
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
                {isLoading ? "Verificando..." : "Verificar"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </GeneralSheet>
  );
}
