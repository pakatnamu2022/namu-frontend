import { useMutation } from "@tanstack/react-query";
import { Badge, BadgeColor } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  FileText,
  User,
  Calendar,
  Package,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Ban,
  SearchCheck,
  Loader2,
  LucideIcon,
} from "lucide-react";
import type { ElectronicDocumentResource } from "../lib/electronicDocument.interface";
import { DetailSheetTable } from "@/shared/components/DetailSheetTable";
import { InfoSection } from "@/shared/components/InfoSection";
import { queryElectronicDocumentStatus } from "../lib/electronicDocument.actions";
import { successToast, errorToast } from "@/core/core.function";
import { Link } from "react-router-dom";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { AREA_COMERCIAL } from "@/features/ap/ap-master/lib/apMaster.constants";
import { CopyCell } from "@/shared/components/CopyCell";

interface ElectronicDocumentDetailSheetProps {
  document: ElectronicDocumentResource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdated?: () => void;
}

export function ElectronicDocumentDetailSheet({
  document,
  open,
  onOpenChange,
  onStatusUpdated,
}: ElectronicDocumentDetailSheetProps) {
  // Hooks must be called before any early returns
  const queryStatusMutation = useMutation({
    mutationFn: (id: number) => queryElectronicDocumentStatus(id),
    onSuccess: () => {
      successToast("Estado consultado exitosamente");
      onStatusUpdated?.();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(`Error al consultar estado: ${msg}`);
    },
  });

  // Early return after hooks
  if (!document) return null;

  const handleQueryStatus = () => {
    queryStatusMutation.mutate(document.id);
  };

  const currencySymbol =
    document.currency?.iso_code === "PEN"
      ? "S/"
      : document.currency?.iso_code === "USD"
        ? "$"
        : "";

  const statusConfig: Record<
    string,
    { label: string; icon: LucideIcon; color: BadgeColor }
  > = {
    draft: {
      label: "Borrador",
      icon: FileText,
      color: "gray",
    },
    sent: {
      label: "Enviado",
      icon: Send,
      color: "blue",
    },
    accepted: {
      label: "Aceptado",
      icon: CheckCircle,
      color: "green",
    },
    rejected: {
      label: "Rechazado",
      icon: XCircle,
      color: "red",
    },
    cancelled: {
      label: "Anulado",
      icon: Ban,
      color: "orange",
    },
  };

  const config = statusConfig[document.status as keyof typeof statusConfig];

  return (
    <GeneralSheet
      open={open}
      onClose={() => onOpenChange(false)}
      icon="FileText"
      title="Detalle del Documento Electrónico"
      subtitle="Información completa del documento electrónico incluyendo datos del cliente, items y estado SUNAT."
      size="5xl"
    >
      <div className="mt-6 space-y-6">
        {/* Estado y Tipo */}
        <InfoSection
          title="Información del Documento"
          icon={FileText}
          columns={2}
          fields={[
            {
              label: "Estado",
              value: (
                <Badge
                  variant="outline"
                  color={config?.color}
                  icon={config.icon}
                >
                  <span>{config?.label}</span>
                </Badge>
              ),
            },
            {
              label: "Tipo de Documento",
              value: document.document_type?.description || "N/A",
            },
            {
              label: "Serie",
              value: (
                <CopyCell
                  value={document.serie}
                  label={document.serie}
                  className="text-sm font-semibold"
                />
              ),
            },
            {
              label: "Número",
              value: (
                <CopyCell
                  value={String(document.numero).padStart(8, "0")}
                  label={String(document.numero).padStart(8, "0")}
                  className="text-sm font-semibold"
                />
              ),
            },
          ]}
        />

        {/* Archivos */}
        <Separator />
        <div className="space-y-3">
          <h3 className="font-semibold">Archivos Disponibles</h3>
          <div className="flex flex-wrap gap-2">
            {document.enlace_del_pdf && (
              <Button variant="outline" size="sm" asChild>
                <Link
                  to={document.enlace_del_pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar PDF
                </Link>
              </Button>
            )}
            {document.enlace_del_xml && (
              <Button variant="outline" size="sm" asChild>
                <Link
                  to={document.enlace_del_xml}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar XML
                </Link>
              </Button>
            )}
            {document.enlace_del_cdr && (
              <Button variant="outline" size="sm" asChild>
                <Link
                  to={document.enlace_del_cdr}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar CDR
                </Link>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleQueryStatus}
              disabled={queryStatusMutation.isPending}
            >
              {queryStatusMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <SearchCheck className="h-4 w-4 mr-2" />
              )}
              Consultar a Sunat
            </Button>
          </div>
        </div>

        <Separator />

        {/* Información del Cliente */}
        <InfoSection
          title="Información del Cliente"
          icon={User}
          columns={2}
          fields={[
            { label: "Razón Social", value: document.cliente_denominacion },
            {
              label:
                document.identity_document_type?.description || "Documento",
              value: document.cliente_numero_de_documento,
            },
            ...(document.cliente_direccion
              ? [
                  {
                    label: "Dirección",
                    value: document.cliente_direccion,
                    fullWidth: true as const,
                  },
                ]
              : []),
            ...(document.cliente_email
              ? [{ label: "Email", value: document.cliente_email }]
              : []),
          ]}
        />

        <Separator />

        {/* Fechas y Operación */}
        <InfoSection
          title="Fechas y Operación"
          icon={Calendar}
          columns={4}
          fields={[
            {
              label: "Fecha de Emisión",
              value: new Date(document.fecha_de_emision).toLocaleDateString(
                "es-PE",
                {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                },
              ),
            },
            ...(document.fecha_de_vencimiento
              ? [
                  {
                    label: "Fecha de Vencimiento",
                    value: new Date(
                      document.fecha_de_vencimiento,
                    ).toLocaleDateString("es-PE", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    }),
                  },
                ]
              : []),
            {
              label: "Tipo de Operación",
              value: document.transaction_type?.description || "N/A",
            },
            {
              label: "Módulo de Origen",
              value: (
                <Badge variant="outline">
                  {document.area_id === AREA_COMERCIAL
                    ? "Comercial"
                    : "Posventa"}
                </Badge>
              ),
            },
            ...(document.documento_que_se_modifica_serie &&
            document.documento_que_se_modifica_numero
              ? [
                  {
                    label: "Documento que modifica",
                    value: (
                      <Badge variant="outline">
                        {`${document.documento_que_se_modifica_serie}-${document.documento_que_se_modifica_numero}`}
                      </Badge>
                    ),
                  },
                ]
              : []),
            ...(document.condiciones_de_pago
              ? [
                  {
                    label: "Condiciones de Pago",
                    value: document.condiciones_de_pago,
                  },
                ]
              : []),
            ...(document.medio_de_pago
              ? [{ label: "Medio de Pago", value: document.medio_de_pago }]
              : []),
          ]}
        />

        {/* Items del Documento */}
        <Separator />
        <div className="space-y-3">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Items del Documento ({document.items?.length ?? 0})
          </h3>
          <DetailSheetTable
            rows={document.items ?? []}
            columns={[
              {
                header: "Descripción",
                render: (item) => (
                  <div>
                    <div className="text-xs font-medium text-nowrap! whitespace-pre-line">
                      {item.descripcion}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.unidad_de_medida}
                    </div>
                    {item.codigo && !document.is_advance_payment && (
                      <CopyCell
                        value={item.codigo}
                        label={`Cód : ${item.codigo}`}
                        className="text-xs text-muted-foreground"
                      />
                    )}
                    {item.dyn_code && (
                      <CopyCell
                        value={item.dyn_code}
                        label={`Cód Dyn : ${item.dyn_code}`}
                        className="text-xs text-muted-foreground"
                      />
                    )}
                  </div>
                ),
              },
              {
                header: "Cant.",
                className: "text-center",
                render: (item) => item.cantidad,
              },
              {
                header: "P. Unit.",
                className: "text-right",
                render: (item) =>
                  `${currencySymbol} ${item.precio_unitario.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`,
              },
              {
                header: "Total",
                className: "text-right",
                render: (item) => (
                  <span className="font-medium">
                    {currencySymbol}{" "}
                    {item.total.toLocaleString("es-PE", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                ),
              },
            ]}
            getKey={(_, index) => index}
            footer={
              <div className="flex items-start justify-between gap-6 rounded-lg border border-primary/20 bg-primary/5 px-5 py-4">
                {/* Moneda */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Moneda</span>
                  <Badge variant="outline" className="font-semibold w-fit">
                    {document.currency?.description || "N/A"}
                  </Badge>
                  {document.tipo_de_cambio && (
                    <div className="mt-1">
                      <span className="text-xs text-muted-foreground">
                        Tipo de Cambio
                      </span>
                      <p className="text-sm font-medium">
                        {document.tipo_de_cambio}
                      </p>
                    </div>
                  )}
                </div>

                {/* Subtotales + Total */}
                <div className="flex flex-col gap-1 min-w-[220px]">
                  {document.total_gravada && document.total_gravada > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Op. Gravada</span>
                      <span className="font-medium tabular-nums">
                        {currencySymbol}{" "}
                        {document.total_gravada.toLocaleString("es-PE", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  )}
                  {document.total_exonerada && document.total_exonerada > 0 ? (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Op. Exonerada
                      </span>
                      <span className="font-medium tabular-nums">
                        {currencySymbol}{" "}
                        {document.total_exonerada.toLocaleString("es-PE", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  ) : null}
                  {document.total_inafecta && document.total_inafecta > 0 ? (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Op. Inafecta
                      </span>
                      <span className="font-medium tabular-nums">
                        {currencySymbol}{" "}
                        {document.total_inafecta.toLocaleString("es-PE", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      IGV ({document.porcentaje_de_igv}%)
                    </span>
                    <span className="font-medium tabular-nums">
                      {currencySymbol}{" "}
                      {(document.total_igv || 0).toLocaleString("es-PE", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <Separator className="my-1.5" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-primary">
                      Total
                    </span>
                    <span className="text-lg font-bold text-primary tabular-nums">
                      {currencySymbol}{" "}
                      {document.total.toLocaleString("es-PE", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            }
          />
        </div>

        {/* Estado SUNAT */}
        <Separator />
        <div className="space-y-3">
          <h3 className="font-semibold">Estado SUNAT</h3>
          <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              {document.aceptada_por_sunat === true &&
              document.status !== "draft" ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    Aceptado por SUNAT
                  </span>
                </>
              ) : document.aceptada_por_sunat === false &&
                document.status !== "draft" ? (
                <>
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-600">
                    Rechazado por SUNAT
                  </span>
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Pendiente de envío
                  </span>
                </>
              )}
            </div>
            {document.sunat_description && (
              <p className="text-xs text-muted-foreground">
                {document.sunat_description}
              </p>
            )}
          </div>
        </div>

        {/* Observaciones */}
        {document.observaciones && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="font-semibold">Observaciones</h3>
              <p className="text-sm text-muted-foreground">
                {document.observaciones}
              </p>
            </div>
          </>
        )}

        {/* Notas Internas */}
        {document.internal_note && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="font-semibold">Comentario</h3>
              <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                {document.internal_note}
              </p>
            </div>
          </>
        )}
      </div>
    </GeneralSheet>
  );
}
