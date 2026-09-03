"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Form, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FileForm } from "@/shared/components/FileForm";
import { errorToast } from "@/core/core.function";
import { importHistoricalCalculations } from "../lib/payroll-calculation.actions";
import { HistoricalImportResponse } from "../lib/payroll-calculation.interface";
import GeneralSheet from "@/shared/components/GeneralSheet";

interface Props {
  open: boolean;
  onClose: () => void;
  companyId: number;
  companyName?: string;
  onSuccess: () => void;
}

interface FormValues {
  file: File | null;
}

export default function PayrollHistoricalImportDialog({
  open,
  onClose,
  companyId,
  companyName,
  onSuccess,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<HistoricalImportResponse | null>(null);

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
      const res = await importHistoricalCalculations(values.file, companyId);
      setResult(res);
      if (res.rows_processed > 0) {
        onSuccess();
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Error al importar el archivo";
      errorToast(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GeneralSheet
      open={open}
      onClose={handleClose}
      title="Importar histórico de conceptos variables"
      subtitle={companyName ? `Empresa: ${companyName}` : undefined}
      icon="FileUp"
      size="3xl"
    >
      {result ? (
        <div className="space-y-4">
          <div
            className={`flex items-start gap-3 rounded-lg p-3 ${
              result.success
                ? "bg-green-50 text-green-800"
                : "bg-amber-50 text-amber-800"
            }`}
          >
            {result.success ? (
              <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 size-5 shrink-0" />
            )}
            <div>
              <p className="text-sm font-medium">
                Filas procesadas: {result.rows_processed}
              </p>
              {result.periods_created.length > 0 && (
                <p className="mt-1 text-xs">
                  Períodos creados: {result.periods_created.join(", ")}
                </p>
              )}
            </div>
          </div>

          {result.skipped.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-amber-600">
                Filas omitidas
              </p>
              <div className="overflow-hidden rounded-md border">
                <table className="w-full text-xs">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">
                        Motivo
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.skipped.map((reason, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-3 py-2 text-destructive">
                          {reason}
                        </td>
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
              Sube el Excel (.xlsx, .xls) con el histórico de conceptos
              variables (horas extra, feriado, DDT, bonif. nocturna) — mismo
              formato que la plantilla descargable. Los meses que no existan
              se crean automáticamente.
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
