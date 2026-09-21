import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertTriangle, Braces, Boxes, BookText } from "lucide-react";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { ButtonAction } from "@/shared/components/ButtonAction";
import { Badge, BadgeColor } from "@/components/ui/badge";
import { previewTraverseDynamicsPayloadElectronicDocument } from "../lib/electronicDocument.actions";
import type { TraverseDynamicsPayloadPreviewResource } from "../lib/electronicDocument.interface";

interface ElectronicDocumentTraverseDynamicsPreviewProps {
  documentId: number;
}

function formatNumber(value: number | undefined) {
  return Number(value ?? 0).toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const MIGRATION_STATUS_CONFIG: Record<
  string,
  { label: string; color: BadgeColor }
> = {
  pending: { label: "Pendiente", color: "yellow" },
  in_progress: { label: "En Proceso", color: "blue" },
  completed: { label: "Completado", color: "green" },
  failed: { label: "Fallido", color: "red" },
};

function ProcesoEstadoBadge({ value }: { value: number }) {
  const config: Record<number, { label: string; color: BadgeColor }> = {
    1: { label: "Procesado", color: "green" },
    2: { label: "Error", color: "red" },
    0: { label: "Pendiente", color: "yellow" },
  };
  const { label, color } = config[value] ?? { label: String(value), color: "gray" };
  return <Badge color={color}>{label}</Badge>;
}

export default function ElectronicDocumentTraverseDynamicsPreview({
  documentId,
}: ElectronicDocumentTraverseDynamicsPreviewProps) {
  const [open, setOpen] = useState(false);

  const { data, isFetching, isError, error } =
    useQuery<TraverseDynamicsPayloadPreviewResource>({
      queryKey: ["electronicDocumentTraverseDynamicsPreview", documentId],
      queryFn: () =>
        previewTraverseDynamicsPayloadElectronicDocument(documentId),
      enabled: open,
      retry: false,
    });

  const errorMessage =
    (error as any)?.response?.data?.message ||
    "No se pudo obtener el payload de Dynamics para la travesía.";

  const migrationStatus = data?.document_info.traverse_migration_status;
  const migrationStatusConfig = migrationStatus
    ? (MIGRATION_STATUS_CONFIG[migrationStatus] ?? {
        label: migrationStatus,
        color: "gray" as BadgeColor,
      })
    : undefined;

  const groups = data?.dynamics_payload ?? [];

  return (
    <>
      <ButtonAction
        tooltip="Previsualizar payload Dynamics (Travesía)"
        icon={Braces}
        color="blue"
        onClick={() => setOpen(true)}
      />

      <GeneralSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Payload Dynamics - Travesía"
        subtitle={
          data
            ? `${data.document_info.full_number} · ${data.preview_mode}`
            : `Documento #${documentId}`
        }
        icon="Braces"
        size="4xl"
      >
        {isFetching && (
          <div className="flex h-96 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isFetching && isError && (
          <div className="flex h-96 flex-col items-center justify-center gap-2 text-center">
            <AlertTriangle className="size-8 text-rose-500" />
            <p className="text-sm font-medium text-rose-600">
              {errorMessage}
            </p>
          </div>
        )}

        {!isFetching && !isError && data && (
          <div className="space-y-4">
            {/* Resumen del documento */}
            <div className="grid grid-cols-1 gap-3 rounded-md border bg-muted/30 p-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-muted-foreground">Documento</p>
                <p className="font-semibold">
                  {data.document_info.full_number}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Fecha de emisión</p>
                <p className="font-semibold">
                  {data.document_info.fecha_emision}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Estado migración</p>
                {migrationStatusConfig && (
                  <Badge color={migrationStatusConfig.color}>
                    {migrationStatusConfig.label}
                  </Badge>
                )}
              </div>
              <div>
                <p className="text-muted-foreground">Compra asociada</p>
                <Badge
                  color={
                    data.document_info.associate_purchase_traverse
                      ? "green"
                      : "gray"
                  }
                >
                  {data.document_info.associate_purchase_traverse
                    ? "Sí"
                    : "No"}
                </Badge>
              </div>
            </div>

            {/* Resumen general */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-md border p-3 text-center">
                <p className="text-xs text-muted-foreground">Modo</p>
                <p className="text-sm font-semibold">{data.preview_mode}</p>
              </div>
              <div className="rounded-md border p-3 text-center">
                <p className="text-xs text-muted-foreground">
                  Fechas de compra
                </p>
                <p className="text-sm font-semibold">
                  {data.summary.total_purchase_dates}
                </p>
              </div>
              <div className="rounded-md border p-3 text-center">
                <p className="text-xs text-muted-foreground">Movimientos</p>
                <p className="text-sm font-semibold">
                  {data.summary.total_movements}
                </p>
              </div>
            </div>

            {/* Grupos por fecha de compra */}
            {groups.map((group, groupIndex) => {
              const adjustment = group.paso_1_adjustment;
              const accounting = group.paso_2_accounting;
              // El backend puede mandar `header` como objeto único o como
              // arreglo (p. ej. `[]` cuando no hay movimiento de ajuste).
              const adjustmentHeaders = adjustment
                ? Array.isArray(adjustment.header)
                  ? adjustment.header
                  : [adjustment.header]
                : [];

              const totalDebito =
                accounting?.details.reduce(
                  (acc, d) => acc + Number(d.Debito || 0),
                  0
                ) ?? 0;
              const totalCredito =
                accounting?.details.reduce(
                  (acc, d) => acc + Number(d.Credito || 0),
                  0
                ) ?? 0;

              return (
                <div
                  key={`${group.purchase_date}-${groupIndex}`}
                  className="space-y-3 rounded-md border-2 border-dashed p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Fecha de compra
                    </span>
                    <Badge color="blue">{group.purchase_date}</Badge>
                  </div>

                  {/* Paso 1: Ajuste de inventario */}
                  {adjustment && (
                    <div className="rounded-md border">
                      <div className="flex items-center gap-2 border-b bg-muted/50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <Boxes className="size-4" />
                        Paso 1 · Ajuste de Inventario
                      </div>

                      {/* Cabecera */}
                      <div className="flex items-center justify-between border-b bg-muted/20 px-3 py-1.5">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Cabecera
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {adjustment.table_header}
                        </span>
                      </div>
                      {adjustmentHeaders.length > 0 ? (
                        <div className="overflow-x-auto border-b">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b bg-muted/10 text-left text-muted-foreground">
                                <th className="px-3 py-1.5 font-medium">
                                  Transacción
                                </th>
                                <th className="px-3 py-1.5 font-medium">
                                  Fecha emisión
                                </th>
                                <th className="px-3 py-1.5 font-medium">
                                  Fecha contable
                                </th>
                                <th className="px-3 py-1.5 font-medium">
                                  Estado proceso
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {adjustmentHeaders.map((h, idx) => (
                                <tr
                                  key={`${h.TransaccionId}-${idx}`}
                                  className="border-b last:border-b-0"
                                >
                                  <td className="px-3 py-1.5 font-mono">
                                    {h.TransaccionId}
                                  </td>
                                  <td className="px-3 py-1.5">
                                    {h.FechaEmision}
                                  </td>
                                  <td className="px-3 py-1.5">
                                    {h.FechaContable}
                                  </td>
                                  <td className="px-3 py-1.5">
                                    <ProcesoEstadoBadge
                                      value={h.ProcesoEstado}
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="border-b px-3 py-2 text-xs text-muted-foreground">
                          Sin cabecera de ajuste.
                        </p>
                      )}

                      {/* Detalle */}
                      <div className="flex items-center justify-between border-b bg-muted/20 px-3 py-1.5">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Detalle
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {adjustment.table_detail}
                        </span>
                      </div>
                      {adjustment.details.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b bg-muted/10 text-left text-muted-foreground">
                                <th className="px-3 py-1.5 font-medium">
                                  Línea
                                </th>
                                <th className="px-3 py-1.5 font-medium">
                                  Artículo
                                </th>
                                <th className="px-3 py-1.5 font-medium">
                                  Motivo
                                </th>
                                <th className="px-3 py-1.5 font-medium">
                                  Almacén
                                </th>
                                <th className="px-3 py-1.5 text-right font-medium">
                                  Cantidad
                                </th>
                                <th className="px-3 py-1.5 font-medium">
                                  UM
                                </th>
                                <th className="px-3 py-1.5 text-right font-medium">
                                  Costo Unit.
                                </th>
                                <th className="px-3 py-1.5 font-medium">
                                  Cta. Inventario
                                </th>
                                <th className="px-3 py-1.5 font-medium">
                                  Cta. Contrapartida
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {adjustment.details.map((detail) => (
                                <tr
                                  key={`${detail.TransaccionId}-${detail.Linea}`}
                                  className="border-b last:border-b-0"
                                >
                                  <td className="px-3 py-1.5">
                                    {detail.Linea}
                                  </td>
                                  <td className="px-3 py-1.5 font-mono">
                                    {detail.ArticuloId}
                                  </td>
                                  <td className="px-3 py-1.5">
                                    {detail.Motivo}
                                  </td>
                                  <td className="px-3 py-1.5 font-mono">
                                    {detail.AlmacenId}
                                  </td>
                                  <td
                                    className={`px-3 py-1.5 text-right font-medium ${
                                      detail.Cantidad < 0
                                        ? "text-rose-600"
                                        : "text-emerald-600"
                                    }`}
                                  >
                                    {detail.Cantidad}
                                  </td>
                                  <td className="px-3 py-1.5">
                                    {detail.UnidadMedidaId}
                                  </td>
                                  <td className="px-3 py-1.5 text-right">
                                    {formatNumber(detail.CostoUnitario)}
                                  </td>
                                  <td className="px-3 py-1.5 font-mono">
                                    {detail.CuentaInventario}
                                  </td>
                                  <td className="px-3 py-1.5 font-mono">
                                    {detail.CuentaContrapartida}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="px-3 py-2 text-xs text-muted-foreground">
                          Sin líneas de ajuste.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Paso 2: Asiento contable */}
                  {accounting && (
                    <div className="rounded-md border">
                      <div className="flex items-center gap-2 border-b bg-muted/50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <BookText className="size-4" />
                        Paso 2 · Asiento Contable
                      </div>

                      {/* Cabecera */}
                      <div className="flex items-center justify-between border-b bg-muted/20 px-3 py-1.5">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Cabecera
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {accounting.table_header}
                        </span>
                      </div>
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-1.5 border-b p-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <dt className="text-muted-foreground">Asiento</dt>
                          <dd className="font-medium">
                            N° {accounting.header.Asiento}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">
                            Referencia
                          </dt>
                          <dd className="font-medium font-mono">
                            {accounting.header.Referencia}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Fecha</dt>
                          <dd className="font-medium">
                            {accounting.header.Fecha}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">
                            Moneda / T.C.
                          </dt>
                          <dd className="font-medium">
                            {accounting.header.MonedaId} ·{" "}
                            {accounting.header.TipoTasaId} ·{" "}
                            {accounting.header.TipoCambio}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Lote</dt>
                          <dd className="font-medium font-mono">
                            {accounting.header.LoteId}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Estado</dt>
                          <dd>
                            <ProcesoEstadoBadge
                              value={accounting.header.Estado}
                            />
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">
                            Fecha estado
                          </dt>
                          <dd className="font-medium">
                            {accounting.header.FechaEstado}
                          </dd>
                        </div>
                        {accounting.header.Error && (
                          <div className="lg:col-span-4">
                            <dt className="text-muted-foreground">Error</dt>
                            <dd className="font-medium text-rose-600">
                              {accounting.header.Error}
                            </dd>
                          </div>
                        )}
                      </dl>

                      {/* Detalle */}
                      <div className="flex items-center justify-between border-b bg-muted/20 px-3 py-1.5">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Detalle
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {accounting.table_detail}
                        </span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b bg-muted/10 text-left text-muted-foreground">
                              <th className="px-3 py-1.5 font-medium">
                                Línea
                              </th>
                              <th className="px-3 py-1.5 font-medium">
                                Cuenta
                              </th>
                              <th className="px-3 py-1.5 font-medium">
                                Descripción
                              </th>
                              <th className="px-3 py-1.5 text-right font-medium">
                                Débito
                              </th>
                              <th className="px-3 py-1.5 text-right font-medium">
                                Crédito
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {accounting.details.map((detail) => (
                              <tr
                                key={`${detail.Asiento}-${detail.Linea}`}
                                className="border-b last:border-b-0"
                              >
                                <td className="px-3 py-1.5">
                                  {detail.Linea}
                                </td>
                                <td className="px-3 py-1.5 font-mono">
                                  {detail.CuentaNumero}
                                </td>
                                <td className="px-3 py-1.5">
                                  {detail.Descripcion}
                                </td>
                                <td className="px-3 py-1.5 text-right font-medium">
                                  {Number(detail.Debito) > 0
                                    ? formatNumber(detail.Debito)
                                    : "-"}
                                </td>
                                <td className="px-3 py-1.5 text-right font-medium">
                                  {Number(detail.Credito) > 0
                                    ? formatNumber(detail.Credito)
                                    : "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="bg-muted/20 font-semibold">
                              <td className="px-3 py-1.5" colSpan={3}>
                                Total
                              </td>
                              <td className="px-3 py-1.5 text-right">
                                {formatNumber(totalDebito)}
                              </td>
                              <td className="px-3 py-1.5 text-right">
                                {formatNumber(totalCredito)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      {totalDebito !== totalCredito && (
                        <div className="flex items-center gap-2 border-t bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-950/30 dark:text-rose-400">
                          <AlertTriangle className="size-3.5" />
                          El asiento no cuadra: débito y crédito no
                          coinciden.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* JSON completo */}
            <details className="rounded-md border">
              <summary className="cursor-pointer select-none bg-muted/30 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Ver JSON completo
              </summary>
              <div className="max-h-[50vh] overflow-auto p-3">
                <pre className="whitespace-pre-wrap break-all text-xs text-foreground">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        )}
      </GeneralSheet>
    </>
  );
}
