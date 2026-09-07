"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Form, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FileForm } from "@/shared/components/FileForm";
import { errorToast } from "@/core/core.function";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { DataTable } from "@/shared/components/DataTable";
import { updateOcsiInvoiceByVin } from "../lib/vehiclePurchaseOrder.actions";
import type { OcsiInvoiceByVinResponse } from "../lib/vehiclePurchaseOrder.interface";
import { ocsiInvoiceByVinColumns } from "./OcsiInvoiceUpdateByVinColumns";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormValues {
  file: File | null;
}

export default function OcsiInvoiceUpdateByVinSheet({
  open,
  onClose,
  onSuccess,
}: Props) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [preview, setPreview] = useState<OcsiInvoiceByVinResponse | null>(null);
  const [applied, setApplied] = useState<OcsiInvoiceByVinResponse | null>(null);

  const form = useForm<FormValues>({ defaultValues: { file: null } });
  const file = form.watch("file");

  const resetAll = () => {
    form.reset();
    setPreview(null);
    setApplied(null);
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const okCount =
    preview?.rows.filter((r) => r.status === "ok").length ?? 0;

  const onAnalyze = async (values: FormValues) => {
    if (!values.file) {
      errorToast("Selecciona un archivo para analizar");
      return;
    }
    setIsAnalyzing(true);
    try {
      const res = await updateOcsiInvoiceByVin(values.file, true);
      setPreview(res);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Error al analizar el archivo";
      errorToast(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onConfirm = async () => {
    if (!file) return;
    setIsApplying(true);
    try {
      const res = await updateOcsiInvoiceByVin(file, false);
      setApplied(res);
      if (res.updated > 0) onSuccess?.();
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Error al actualizar las órdenes";
      errorToast(msg);
    } finally {
      setIsApplying(false);
    }
  };

  const result = applied ?? preview;

  return (
    <GeneralSheet
      open={open}
      onClose={handleClose}
      title="Actualizar Fecha/Factura OC Stock Inicial"
      icon="FileUp"
      size="6xl"
    >
      {!result ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onAnalyze)}
            className="space-y-4"
          >
            <p className="text-sm text-muted-foreground">
              Sube el Excel (.xlsx, .xls, .csv) con las columnas{" "}
              <b>vin</b>, <b>fecha</b> y <b>factura</b> (formato{" "}
              <code>F001-00001234</code>). Solo se actualizarán las órdenes de
              compra de stock inicial (OCSI-) con fecha de emisión 2026-06-30.
              El análisis no modifica nada hasta que confirmes.
            </p>
            <FormField
              control={form.control}
              name="file"
              render={({ field: { onChange, value } }) => (
                <FileForm
                  label="Archivo Excel"
                  accept=".xlsx,.xls,.csv"
                  multiple={false}
                  value={value}
                  onChange={onChange}
                  disabled={isAnalyzing}
                />
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClose}
                disabled={isAnalyzing}
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={isAnalyzing || !file}>
                {isAnalyzing ? "Analizando..." : "Analizar"}
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <div className="space-y-4">
          <div
            className={`flex items-start gap-3 rounded-lg p-3 ${
              result.errors.length === 0
                ? "bg-green-50 text-green-800"
                : "bg-amber-50 text-amber-800"
            }`}
          >
            {result.errors.length === 0 ? (
              <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 size-5 shrink-0" />
            )}
            <div>
              <p className="text-sm font-medium">
                {applied
                  ? "Actualización completada"
                  : "Vista previa (no se ha modificado nada)"}
              </p>
              <p className="mt-1 text-xs">
                {applied
                  ? `Actualizadas: ${result.updated}`
                  : `A actualizar: ${okCount}`}{" "}
                · Errores: {result.errors.length} · Filas:{" "}
                {result.rows.length}
              </p>
            </div>
          </div>

          {result.rows.length > 0 && (
            <DataTable
              columns={ocsiInvoiceByVinColumns}
              data={result.rows}
              isVisibleColumnFilter={false}
            />
          )}

          <div className="flex justify-between gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetAll}
              disabled={isApplying}
            >
              {applied ? "Nueva importación" : "Volver a subir"}
            </Button>
            {applied ? (
              <Button size="sm" onClick={handleClose}>
                Cerrar
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={onConfirm}
                disabled={isApplying || okCount === 0}
              >
                {isApplying
                  ? "Actualizando..."
                  : `Confirmar actualización (${okCount})`}
              </Button>
            )}
          </div>
        </div>
      )}
    </GeneralSheet>
  );
}
