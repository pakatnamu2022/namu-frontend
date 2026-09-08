"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { AlertCircle, CheckCircle2, Copy } from "lucide-react";
import { Form, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FileForm } from "@/shared/components/FileForm";
import { errorToast, successToast } from "@/core/core.function";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { DataTable } from "@/shared/components/DataTable";
import { bulkRegisterHistoricalFinalSale } from "../lib/electronicDocument.actions";
import type { HistoricalFinalSaleBulkResponse } from "../lib/electronicDocument.interface";
import { historicalFinalSaleBulkColumns } from "./HistoricalFinalSaleBulkColumns";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormValues {
  file: File | null;
}

// Orden fijo: primero errores, luego omitidas, al final las que quedaron listas.
const STATUS_ORDER: Record<string, number> = { error: 0, skipped: 1, ok: 2 };

export default function HistoricalFinalSaleBulkSheet({
  open,
  onClose,
  onSuccess,
}: Props) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [preview, setPreview] = useState<HistoricalFinalSaleBulkResponse | null>(
    null,
  );
  const [applied, setApplied] = useState<HistoricalFinalSaleBulkResponse | null>(
    null,
  );

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

  const okCount = preview?.rows.filter((r) => r.status === "ok").length ?? 0;
  const skippedCount =
    preview?.rows.filter((r) => r.status === "skipped").length ?? 0;

  const result = applied ?? preview;

  const sortedRows = useMemo(
    () =>
      [...(result?.rows ?? [])].sort(
        (a, b) =>
          (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9) ||
          a.row - b.row,
      ),
    [result],
  );

  const copyAsCells = async () => {
    const headers = [
      "Fila",
      "VIN",
      "Comprobante",
      "Fecha",
      "Cliente",
      "Asesor",
      "Margen (monto / %)",
      "Factura · Precio venta",
      "Solicitud",
      "Estado",
      "Detalle",
    ];
    const statusLabel: Record<string, string> = {
      ok: "Listo",
      skipped: "Omitida",
      error: "Error",
    };
    const lines = sortedRows.map((r) =>
      [
        r.row,
        r.vin ?? "",
        r.comprobante ?? "",
        r.fecha ?? "",
        r.cliente ?? "",
        r.asesor ?? "",
        r.beneficio ?? "",
        r.total ?? "",
        r.quote_action ?? "",
        statusLabel[r.status] ?? r.status,
        (r.message ?? "").replace(/\s+/g, " ").trim(),
      ].join("\t"),
    );
    const tsv = [headers.join("\t"), ...lines].join("\n");
    try {
      await navigator.clipboard.writeText(tsv);
      successToast("Tabla copiada. Pégala en Excel o Sheets.");
    } catch {
      errorToast("No se pudo copiar al portapapeles");
    }
  };

  const onAnalyze = async (values: FormValues) => {
    if (!values.file) {
      errorToast("Selecciona un archivo para analizar");
      return;
    }
    setIsAnalyzing(true);
    try {
      const res = await bulkRegisterHistoricalFinalSale(values.file, true);
      setPreview(res);
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message || "Error al analizar el archivo",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onConfirm = async () => {
    if (!file) return;
    setIsApplying(true);
    try {
      const res = await bulkRegisterHistoricalFinalSale(file, false);
      setApplied(res);
      if (res.created > 0) onSuccess?.();
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message || "Error al registrar las ventas",
      );
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <GeneralSheet
      open={open}
      onClose={handleClose}
      title="Registro Masivo de Ventas Históricas"
      subtitle="Sube la plantilla del stock inicial ya vendido/entregado sin factura. Se crea la solicitud + la factura (REGISTRO EXTERNO) y el movimiento FACTURADO FINAL por cada VIN."
      icon="History"
      size="6xl"
    >
      {!result ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onAnalyze)} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Columnas: <b>vin</b>, <b>asesor</b> (DNI o nombre exacto),{" "}
              <b>cliente_dni</b> (si no existe se crea: 8 díg = DNI, 9 = carné
              extranjería, 11 = RUC 10 natural / 20 jurídica; el nombre se toma de
              RENIEC/SUNAT o de la columna opcional <b>cliente_nombre</b>),{" "}
              <b>serie</b>, <b>numero</b>,{" "}
              <b>fecha_factura</b> (dd/mm/aaaa), <b>total_factura</b> (monto de
              la última factura; puede ser <b>0</b> si los anticipos cubrieron el
              saldo), <b>margen_monto</b>, <b>margen_pct</b> (ej. 12.5),{" "}
              <b>sede</b> (opcional) y <b>descripcion</b> (opcional). Todo es en
              USD. El <b>total_factura</b> se registra tal cual; la cotización sí
              debe tener valor y su precio de venta se reconstruye del margen:{" "}
              <b>margen_monto ÷ (margen_pct ÷ 100) × 1.18</b>. Los VIN que ya
              tengan venta interna, factura o movimiento FACTURADO FINAL se
              omiten. El análisis no modifica nada hasta que confirmes.
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
                  ? "Registro completado"
                  : "Vista previa (no se ha registrado nada)"}
              </p>
              <p className="mt-1 text-xs">
                {applied
                  ? `Registradas: ${result.created}`
                  : `A registrar: ${okCount}`}{" "}
                · Omitidas: {applied ? result.skipped : skippedCount} · Errores:{" "}
                {result.errors.length} · Filas: {result.rows.length}
              </p>
            </div>
          </div>

          {result.rows.length > 0 && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  Orden: errores → omitidas → listas.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyAsCells}
                >
                  <Copy className="mr-2 size-4" />
                  Copiar tabla
                </Button>
              </div>
              <DataTable
                columns={historicalFinalSaleBulkColumns}
                data={sortedRows}
                isVisibleColumnFilter={false}
              />
            </>
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
                  ? "Registrando..."
                  : `Confirmar registro (${okCount})`}
              </Button>
            )}
          </div>
        </div>
      )}
    </GeneralSheet>
  );
}
