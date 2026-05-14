import { Badge } from "@/components/ui/badge.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Button } from "@/components/ui/button.tsx";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  FileText,
  Download,
  QrCode,
  FileCode,
  FileCheck,
  CheckCircle2,
  XCircle,
  User,
  Building2,
  CreditCard,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ProductTransferDetailResource } from "@/features/ap/post-venta/gestion-almacen/guia-remision/lib/productTransfer.interface.ts";
import GeneralSheet from "@/shared/components/GeneralSheet.tsx";
import { findProductTransferById } from "@/features/ap/post-venta/gestion-almacen/guia-remision/lib/productTransfer.actions.ts";
import { InfoSection } from "@/shared/components/InfoSection";
import { CopyCell } from "@/shared/components/CopyCell";
import {
  DetailSheetTable,
  DetailSheetTableColumn,
} from "@/shared/components/DetailSheetTable";
import { formatDate } from "@/core/core.function";
import { translateInventoryMovement } from "../../inventario/lib/inventory.constants";

interface ProductTransferViewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transferId: number;
}

const detailColumns: DetailSheetTableColumn<ProductTransferDetailResource>[] = [
  {
    header: "#",
    className: "w-10",
    render: (_, index) => <span className="font-medium">{index + 1}</span>,
  },
  {
    header: "Repuesto / Servicio",
    render: (detail) =>
      detail.product ? (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-sm">{detail.product.name}</span>
          {detail.product.code && (
            <CopyCell
              value={detail.product.code}
              label={`Cód: ${detail.product.code}`}
              className="text-xs text-muted-foreground"
            />
          )}
          {detail.product.dyn_code && (
            <CopyCell
              value={String(detail.product.dyn_code)}
              label={`Cód Dyn: ${detail.product.dyn_code}`}
              className="text-xs text-muted-foreground"
            />
          )}
          {detail.notes && (
            <span className="text-xs text-muted-foreground italic">
              Nota: {detail.notes}
            </span>
          )}
        </div>
      ) : (
        <span className="font-medium text-sm">
          {detail.notes || "Servicio sin descripción"}
        </span>
      ),
  },
  {
    header: "Cantidad",
    className: "text-center w-24",
    render: (detail) => <span>{Number(detail.quantity).toFixed(2)}</span>,
  },
];

export function ProductTransferViewSheet({
  open,
  onOpenChange,
  transferId,
}: ProductTransferViewSheetProps) {
  const { data: transferData, isLoading } = useQuery({
    queryKey: ["product-transfer-detail", transferId],
    queryFn: () => findProductTransferById(transferId),
    enabled: !!transferId && open,
  });

  return (
    <GeneralSheet
      open={open}
      onClose={() => onOpenChange(false)}
      title="Detalle de Transferencia"
      subtitle={
        transferData?.movement_number ||
        "Información completa de la transferencia"
      }
      icon="Truck"
      size="4xl"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : transferData ? (
        <div className="space-y-6 px-6">
          {/* Información del General */}
          <InfoSection
            title="Información General"
            fields={[
              {
                label: "N° Movimiento",
                value: transferData.movement_number,
              },
              {
                label: "Estado",
                value: translateInventoryMovement(transferData.status),
              },
              {
                label: "Fecha de Movimiento",
                value: formatDate(transferData.movement_date),
              },
              {
                label: "Tipo de Movimiento",
                value: (
                  <Badge variant="outline" className="capitalize">
                    {transferData.movement_type === "TRANSFER_OUT"
                      ? "Transferencia Salida"
                      : transferData.movement_type}
                  </Badge>
                ),
              },
              {
                label: "Tipo de Ítem",
                value: (
                  <Badge color="secondary" className="capitalize">
                    {transferData.item_type === "SERVICIO"
                      ? "Servicio"
                      : "Repuesto"}
                  </Badge>
                ),
              },
            ]}
          />

          {/* Información de Almacenes */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Ubicaciones</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">Origen</p>
                <p className="font-semibold">
                  {transferData.reference.transmitter_name}
                </p>
                <p className="text-sm">{transferData.warehouse_code}</p>
              </div>
              <div className="border rounded-lg p-4 bg-muted/50">
                <p className="text-sm text-muted-foreground mb-2">Destino</p>
                <p className="font-semibold">
                  {transferData.reference.receiver_name}
                </p>
                <p className="text-sm">
                  {transferData.warehouse_destination_code ||
                    transferData.reference.receiver_establishment
                      ?.full_address ||
                    "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Información de la Guía de Remisión */}
          {transferData.reference && (
            <>
              <div className="space-y-4">
                <InfoSection
                  title="Información de la Guía de Remisión"
                  fields={[
                    {
                      label: "Número de Documento",
                      value: (
                        <CopyCell
                          value={transferData.reference.document_number}
                          className="font-medium"
                        />
                      ),
                    },
                    {
                      label: "Número de Documento Dynamics",
                      value: (
                        <CopyCell
                          value={transferData.reference.dyn_series}
                          className="font-medium"
                        />
                      ),
                    },
                    {
                      label: "Fecha de Emisión",
                      value: formatDate(transferData.reference.issue_date),
                    },
                    {
                      label: "Motivo de Traslado",
                      value:
                        transferData.reference.transfer_reason_description ||
                        "-",
                    },
                    {
                      label: "Modalidad de Transporte",
                      value:
                        transferData.reference.transfer_modality_description ||
                        "-",
                    },
                    {
                      label: "Placa",
                      value: transferData.reference.plate || "-",
                    },
                    {
                      label: "Peso Total",
                      value: transferData.reference.total_weight,
                    },
                  ]}
                />

                {/* Información del Conductor y Transporte */}
                {(transferData.reference.driver_name ||
                  transferData.reference.license ||
                  transferData.reference.ruc_transport ||
                  transferData.reference.company_name_transport) && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-muted-foreground">
                      Información de Transporte
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border">
                      {(transferData.reference.driver_name ||
                        transferData.reference.license) && (
                        <>
                          <div className="flex items-start gap-2">
                            <User className="size-4 text-muted-foreground mt-1" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-muted-foreground">
                                Conductor
                              </p>
                              <p className="text-sm font-semibold truncate">
                                {transferData.reference.driver_name || "-"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <CreditCard className="size-4 text-muted-foreground mt-1" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-muted-foreground">
                                Licencia
                              </p>
                              <p className="text-sm font-semibold">
                                {transferData.reference.license || "-"}
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                      {(transferData.reference.ruc_transport ||
                        transferData.reference.company_name_transport) && (
                        <>
                          <div className="flex items-start gap-2">
                            <Building2 className="size-4 text-muted-foreground mt-1" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-muted-foreground">
                                Empresa de Transporte
                              </p>
                              <p className="text-sm font-semibold">
                                {transferData.reference
                                  .company_name_transport || "-"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <FileText className="size-4 text-muted-foreground mt-1" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-muted-foreground">
                                RUC
                              </p>
                              <p className="text-sm font-semibold">
                                {transferData.reference.ruc_transport || "-"}
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Estado SUNAT */}
              {transferData.reference.requires_sunat && (
                <>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FileCheck className="size-5" />
                      SUNAT - Estado / Documentos
                    </h3>
                    <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Registrado en SUNAT
                        </span>
                        {transferData.reference.is_sunat_registered ? (
                          <CheckCircle2 className="size-5 text-green-600" />
                        ) : (
                          <XCircle className="size-5 text-secondary" />
                        )}
                      </div>
                      {transferData.reference.sent_at && (
                        <div>
                          <span className="text-sm font-medium">
                            Fecha de Envío:{" "}
                          </span>
                          <span className="text-sm">
                            {formatDate(transferData.reference.sent_at)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Aceptado por SUNAT
                        </span>
                        {transferData.reference.aceptada_por_sunat ? (
                          <CheckCircle2 className="size-5 text-green-600" />
                        ) : (
                          <XCircle className="size-5 text-secondary" />
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Estado de anulación / stock */}
              {!transferData.reference.status && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="size-4 text-destructive/70" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-destructive/70">
                      Registro anulado
                    </span>
                  </div>

                  <Separator className="opacity-30" />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3 py-1">
                      <span className="text-sm text-muted-foreground">
                        Estado en SIAN
                      </span>
                      <Badge
                        variant="outline"
                        className="border-destructive/30 text-destructive bg-transparent text-xs font-medium"
                      >
                        Anulado
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between gap-3 py-1">
                      <span className="text-sm text-muted-foreground">
                        Estado en Dynamics
                      </span>
                      {transferData.reference.is_annulled ? (
                        <Badge
                          variant="outline"
                          className="border-destructive/30 text-destructive bg-transparent text-xs font-medium"
                        >
                          Anulado
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-gray-500/40 text-gray-600 bg-transparent text-xs font-medium"
                        >
                          Pendiente
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed pt-1 border-t border-destructive/10">
                    {!transferData.reference.is_annulled
                      ? "Anulada en SIAN. Falta procesar la anulación en Dynamics para que el stock retorne al almacén origen."
                      : "Anulada en SIAN y en Dynamics. El stock debe estar revertido al almacén origen."}
                  </p>
                </div>
              )}

              {/* Documentos SUNAT */}
              {transferData.reference.requires_sunat &&
                transferData.reference.is_sunat_registered && (
                  <>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {transferData.reference.enlace_del_pdf && (
                          <Link
                            to={transferData.reference.enlace_del_pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full"
                          >
                            <Button
                              variant="outline"
                              className="w-full gap-2 h-20 flex-col"
                            >
                              <FileText className="size-6 text-primary" />
                              <span className="text-xs">Ver PDF</span>
                            </Button>
                          </Link>
                        )}

                        {transferData.reference.enlace_del_xml && (
                          <Link
                            to={transferData.reference.enlace_del_xml}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full"
                          >
                            <Button
                              variant="outline"
                              className="w-full gap-2 h-20 flex-col"
                            >
                              <FileCode className="size-6 text-primary" />
                              <span className="text-xs">Descargar XML</span>
                            </Button>
                          </Link>
                        )}

                        {transferData.reference.enlace_del_cdr && (
                          <Link
                            to={transferData.reference.enlace_del_cdr}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full"
                          >
                            <Button
                              variant="outline"
                              className="w-full gap-2 h-20 flex-col"
                            >
                              <Download className="size-6 text-primary" />
                              <span className="text-xs">Descargar CDR</span>
                            </Button>
                          </Link>
                        )}

                        {transferData.reference.cadena_para_codigo_qr && (
                          <Link
                            to={transferData.reference.cadena_para_codigo_qr}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full"
                          >
                            <Button
                              variant="outline"
                              className="w-full gap-2 h-20 flex-col"
                            >
                              <QrCode className="size-6 text-primary" />
                              <span className="text-xs">Ver QR</span>
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>

                    <Separator />
                  </>
                )}
            </>
          )}

          {/* Repuestos/Servicios Transferidos */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              {transferData.item_type === "SERVICIO"
                ? "Servicios Transferidos"
                : "Repuestos Transferidos"}
            </h3>
            <DetailSheetTable
              rows={transferData.details}
              columns={detailColumns}
              getKey={(detail: ProductTransferDetailResource) => detail.id}
              emptyMessage={
                transferData.item_type === "SERVICIO"
                  ? "No hay servicios en esta transferencia"
                  : "No hay productos en esta transferencia"
              }
            />
          </div>

          {/* Observaciones */}
          {transferData.notes && (
            <>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Observaciones</h3>
                <p className="text-sm border rounded-lg p-3 bg-muted/20">
                  {transferData.notes}
                </p>
              </div>
            </>
          )}

          {/* Información Adicional */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg text-xs">
            <div>
              <p className="text-muted-foreground">Creado por</p>
              <p className="font-medium">{transferData.user_name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Fecha de Creación</p>
              <p className="font-medium">
                {format(new Date(transferData.created_at), "dd/MM/yyyy HH:mm", {
                  locale: es,
                })}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">
            No se encontró información de la transferencia
          </p>
        </div>
      )}
    </GeneralSheet>
  );
}
