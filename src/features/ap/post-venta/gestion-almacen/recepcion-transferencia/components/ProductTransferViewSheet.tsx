import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet.tsx";
import { Badge, BadgeColor } from "@/components/ui/badge.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Button } from "@/components/ui/button.tsx";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/core/api.ts";
import {
  Loader2,
  FileText,
  Download,
  QrCode,
  FileCode,
  Truck,
  Calendar,
  Package,
  FileCheck,
  ClipboardList,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  TransferData,
  TransferDetail,
} from "@/features/ap/post-venta/gestion-almacen/transferencia-producto/lib/productTransfer.interface.ts";

interface ProductTransferViewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transferId: number | null;
}

const getStatusBadge = (status: string) => {
  const statusConfig: {
    [key: string]: {
      label: string;
      color: BadgeColor;
    };
  } = {
    IN_TRANSIT: { label: "En Tránsito", color: "default" },
    COMPLETED: { label: "Completado", color: "secondary" },
    CANCELLED: { label: "Cancelado", color: "destructive" },
    PENDING: { label: "Pendiente", color: "default" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    color: "default",
  };

  return (
    <Badge color={config.color} className="capitalize">
      {config.label}
    </Badge>
  );
};

export function ProductTransferViewSheet({
  open,
  onOpenChange,
  transferId,
}: ProductTransferViewSheetProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["product-transfer-detail", transferId],
    queryFn: async () => {
      const response = await api.get<TransferData>(
        `/ap/postVenta/inventoryMovements/${transferId}`,
      );
      return response.data;
    },
    enabled: !!transferId && open,
  });

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: es });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-3xl lg:max-w-4xl overflow-y-auto"
      >
        <SheetHeader className="pb-6 border-b">
          <SheetTitle className="text-2xl font-bold text-primary">
            Detalle de Transferencia
          </SheetTitle>
          <SheetDescription>
            {data?.movement_number ||
              "Información completa de la transferencia"}
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : data ? (
          <div className="space-y-6 mt-6">
            {/* Información General */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Información General</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">N° Movimiento</p>
                  <p className="font-medium">{data.movement_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  {getStatusBadge(data.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Fecha de Movimiento
                  </p>
                  <p className="font-medium">
                    {format(new Date(data.movement_date), "dd/MM/yyyy HH:mm", {
                      locale: es,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Tipo de Movimiento
                  </p>
                  <Badge variant="outline" className="capitalize">
                    {data.movement_type === "TRANSFER_OUT"
                      ? "Transferencia Salida"
                      : data.movement_type}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de Ítem</p>
                  <Badge color="secondary" className="capitalize">
                    {data.item_type === "SERVICIO" ? "Servicio" : "Producto"}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Información de Almacenes */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Almacenes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Almacén Origen
                  </p>
                  <p className="font-semibold">{data.warehouse_code}</p>
                  <p className="text-sm">{data.warehouse_origin.description}</p>
                </div>
                <div className="border rounded-lg p-4 bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-2">
                    Almacén Destino
                  </p>
                  <p className="font-semibold">
                    {data.warehouse_destination_code}
                  </p>
                  <p className="text-sm">
                    {data.warehouse_destination.description}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Información de la Guía de Remisión */}
            {data.reference && (
              <>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="size-5" />
                    Información de la Guía de Remisión
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-blue-50/50 rounded-lg border border-blue-100">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <FileCheck className="size-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Número de Documento
                          </p>
                          <p className="text-base font-semibold">
                            {data.reference.document_number}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Calendar className="size-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Fecha de Emisión
                          </p>
                          <p className="text-base">
                            {data.reference.issue_date
                              ? format(
                                  new Date(data.reference.issue_date),
                                  "dd/MM/yyyy",
                                  { locale: es },
                                )
                              : "-"}
                          </p>
                        </div>
                      </div>

                      {data.reference.transfer_reason_description && (
                        <div className="flex items-start gap-2">
                          <ClipboardList className="size-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              ID Motivo de Traslado
                            </p>
                            <p className="text-base">
                              {data.reference.transfer_reason_description}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {data.reference.transfer_modality_description && (
                        <div className="flex items-start gap-2">
                          <Truck className="size-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              ID Modalidad de Transporte
                            </p>
                            <p className="text-base">
                              {data.reference.transfer_modality_description}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-2">
                        <Truck className="size-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Placa
                          </p>
                          <p className="text-base font-semibold">
                            {data.reference.plate}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Package className="size-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Peso Total
                          </p>
                          <p className="text-base font-semibold">
                            {data.reference.total_weight} kg
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información del Conductor */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Conductor
                      </p>
                      <p className="text-base">
                        {data.reference.driver_name || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Licencia
                      </p>
                      <p className="text-base">
                        {data.reference.license || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Estado SUNAT */}
                {data.reference.requires_sunat && (
                  <>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FileCheck className="size-5" />
                        Estado SUNAT
                      </h3>
                      <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Registrado en SUNAT
                          </span>
                          {data.reference.is_sunat_registered ? (
                            <CheckCircle2 className="size-5 text-green-600" />
                          ) : (
                            <XCircle className="size-5 text-secondary" />
                          )}
                        </div>
                        {data.reference.sent_at && (
                          <div>
                            <span className="text-sm font-medium">
                              Fecha de Envío:{" "}
                            </span>
                            <span className="text-sm">
                              {formatDate(data.reference.sent_at)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Aceptado por SUNAT
                          </span>
                          {data.reference.aceptada_por_sunat ? (
                            <CheckCircle2 className="size-5 text-green-600" />
                          ) : (
                            <XCircle className="size-5 text-secondary" />
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator />
                  </>
                )}

                {/* Documentos SUNAT */}
                {data.reference.requires_sunat &&
                  data.reference.is_sunat_registered && (
                    <>
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">
                          Documentos SUNAT
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {data.reference.enlace_del_pdf && (
                            <Link
                              to={data.reference.enlace_del_pdf}
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

                          {data.reference.enlace_del_xml && (
                            <Link
                              to={data.reference.enlace_del_xml}
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

                          {data.reference.enlace_del_cdr && (
                            <Link
                              to={data.reference.enlace_del_cdr}
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

                          {data.reference.cadena_para_codigo_qr && (
                            <Link
                              to={data.reference.cadena_para_codigo_qr}
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

            {/* Productos/Servicios Transferidos */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">
                {data.item_type === "SERVICIO"
                  ? "Servicios Transferidos"
                  : "Productos Transferidos"}
              </h3>
              <div className="space-y-3">
                {data.details.map((detail: TransferDetail, index: number) => (
                  <div key={detail.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        {detail.product ? (
                          <>
                            <p className="font-semibold">
                              {detail.product.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Código: {detail.product.code} | Código Dinámico:{" "}
                              {detail.product.dyn_code}
                            </p>
                            {detail.product.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {detail.product.description}
                              </p>
                            )}
                            {detail.notes && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {detail.notes}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="font-semibold">
                            {detail.notes || "Servicio sin descripción"}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-1">
                            Cantidad
                          </p>
                          <Badge
                            color="secondary"
                            className="text-sm font-semibold"
                          >
                            {detail.quantity}
                          </Badge>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          #{index + 1}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Resumen */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Resumen</h3>
              <div className="grid grid-cols-2 gap-4 border rounded-lg p-4 bg-muted/30">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total de Ítems
                  </p>
                  <p className="font-semibold text-lg">{data.total_items}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Cantidad Total
                  </p>
                  <p className="font-semibold text-lg">
                    {parseFloat(data.total_quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Información Adicional */}
            {data.notes && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Observaciones</h3>
                  <p className="text-sm border rounded-lg p-3 bg-muted/20">
                    {data.notes}
                  </p>
                </div>
              </>
            )}

            <Separator />

            {/* Información de Registro */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Información de Registro</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Registrado por</p>
                  <p className="font-medium">{data.user_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fecha de creación</p>
                  <p className="font-medium">
                    {format(new Date(data.created_at), "dd/MM/yyyy HH:mm", {
                      locale: es,
                    })}
                  </p>
                </div>
                {data.updated_at !== data.created_at && (
                  <div>
                    <p className="text-muted-foreground">
                      Última actualización
                    </p>
                    <p className="font-medium">
                      {format(new Date(data.updated_at), "dd/MM/yyyy HH:mm", {
                        locale: es,
                      })}
                    </p>
                  </div>
                )}
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
      </SheetContent>
    </Sheet>
  );
}
