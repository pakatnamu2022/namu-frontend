import { useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  FileText,
  User,
  Calendar,
  DollarSign,
  Package,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Ban,
  SearchCheck,
  Loader2,
  Eye,
} from "lucide-react";
import type { ElectronicDocumentResource } from "../lib/electronicDocument.interface";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { queryElectronicDocumentStatus } from "../lib/electronicDocument.actions";
import { successToast, errorToast } from "@/core/core.function";
import { Link } from "react-router-dom";
import GeneralSheet from "@/shared/components/GeneralSheet";

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

  const statusConfig = {
    draft: {
      label: "Borrador",
      icon: FileText,
      className: "bg-gray-100 text-gray-700 border-gray-300",
    },
    sent: {
      label: "Enviado",
      icon: Send,
      className: "bg-blue-100 text-blue-700 border-blue-300",
    },
    accepted: {
      label: "Aceptado",
      icon: CheckCircle,
      className: "bg-green-100 text-green-700 border-green-300",
    },
    rejected: {
      label: "Rechazado",
      icon: XCircle,
      className: "bg-red-100 text-red-700 border-red-300",
    },
    cancelled: {
      label: "Anulado",
      icon: Ban,
      className: "bg-orange-100 text-orange-700 border-orange-300",
    },
  };

  const config = statusConfig[document.status as keyof typeof statusConfig];
  const StatusIcon = config?.icon || FileText;

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="size-7"
        tooltip="Ver Detalle"
        onClick={() => onOpenChange(true)}
      >
        <Eye className="size-4" />
      </Button>

      <GeneralSheet
        open={open}
        onClose={() => onOpenChange(false)}
        icon="FileText"
        title={`Detalle del Documento Electrónico - ${document.serie}-${String(document.numero).padStart(8, "0")}`}
        subtitle="Información completa del documento electrónico incluyendo datos del cliente, items y estado SUNAT."
        size="5xl"
      >
        <div className="mt-6 space-y-6">
          {/* Estado y Tipo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Estado
              </p>
              <Badge
                variant="outline"
                className={`${config?.className} flex items-center gap-1 w-fit`}
              >
                <StatusIcon className="h-3 w-3" />
                <span>{config?.label}</span>
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Tipo de Documento
              </p>
              <p className="text-sm font-semibold">
                {document.document_type?.description || "N/A"}
              </p>
            </div>
          </div>

          {/* Archivos */}
          {(document.enlace_del_pdf ||
            document.enlace_del_xml ||
            document.enlace_del_cdr) && (
            <>
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
            </>
          )}

          <Separator />

          {/* Información del Cliente */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Información del Cliente</h3>
            </div>
            <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Razón Social</p>
                  <p className="text-sm font-medium">
                    {document.cliente_denominacion}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {document.identity_document_type?.description ||
                      "Documento"}
                  </p>
                  <p className="text-sm font-medium">
                    {document.cliente_numero_de_documento}
                  </p>
                </div>
              </div>
              {document.cliente_direccion && (
                <div>
                  <p className="text-xs text-muted-foreground">Dirección</p>
                  <p className="text-sm">{document.cliente_direccion}</p>
                </div>
              )}
              {document.cliente_email && (
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm">{document.cliente_email}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Fechas y Operación */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Fechas y Operación</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">
                  Fecha de Emisión
                </p>
                <p className="text-sm font-medium">
                  {new Date(document.fecha_de_emision).toLocaleDateString(
                    "es-PE",
                    {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    },
                  )}
                </p>
              </div>
              {document.fecha_de_vencimiento && (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Fecha de Vencimiento
                  </p>
                  <p className="text-sm font-medium">
                    {new Date(
                      document.fecha_de_vencimiento + "T00:00:00",
                    ).toLocaleDateString("es-PE", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">
                  Tipo de Operación
                </p>
                <p className="text-sm">
                  {document.transaction_type?.description || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Módulo de Origen
                </p>
                <Badge variant="outline">
                  {document.origin_module === "comercial"
                    ? "Comercial"
                    : "Posventa"}
                </Badge>
              </div>
              {document.documento_que_se_modifica_serie &&
                document.documento_que_se_modifica_numero && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Documento que modifica
                    </p>
                    <Badge variant="outline">
                      {`${document.documento_que_se_modifica_serie}-${document.documento_que_se_modifica_numero}`}
                    </Badge>
                  </div>
                )}
              {document.condiciones_de_pago && (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Condiciones de Pago
                  </p>
                  <p className="text-sm font-medium">
                    {document.condiciones_de_pago}
                  </p>
                </div>
              )}
              {document.medio_de_pago && (
                <div>
                  <p className="text-xs text-muted-foreground">Medio de Pago</p>
                  <p className="text-sm font-medium">
                    {document.medio_de_pago}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Moneda y Totales */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Moneda y Totales</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Moneda</p>
                <Badge variant="outline" className="font-semibold">
                  {document.currency?.description || "N/A"}
                </Badge>
              </div>
              {document.tipo_de_cambio && (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Tipo de Cambio
                  </p>
                  <p className="text-sm font-medium">
                    {document.tipo_de_cambio}
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-2 bg-primary/5 p-4 rounded-lg border border-primary/20">
              {document.total_gravada && document.total_gravada > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Op. Gravada</span>
                  <span className="font-medium">
                    {currencySymbol}{" "}
                    {document.total_gravada.toLocaleString("es-PE", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
              {document.total_exonerada && document.total_exonerada > 0 ? (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Op. Exonerada</span>
                  <span className="font-medium">
                    {currencySymbol}{" "}
                    {document.total_exonerada.toLocaleString("es-PE", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ) : null}
              {document.total_inafecta && document.total_inafecta > 0 ? (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Op. Inafecta</span>
                  <span className="font-medium">
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
                <span className="font-medium">
                  {currencySymbol}{" "}
                  {(document.total_igv || 0).toLocaleString("es-PE", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-base font-bold text-primary">
                <span>Total</span>
                <span>
                  {currencySymbol}{" "}
                  {document.total.toLocaleString("es-PE", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Items */}
          {document.items && document.items.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">
                    Items del Documento ({document.items.length})
                  </h3>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-center">Cant.</TableHead>
                        <TableHead className="text-right">P. Unit.</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {document.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="text-sm font-medium text-nowrap! whitespace-pre-line">
                              {item.descripcion}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {item.unidad_de_medida}
                              {item.codigo && ` - ${item.codigo}`}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {item.cantidad}
                          </TableCell>
                          <TableCell className="text-right">
                            {currencySymbol}{" "}
                            {item.precio_unitario.toLocaleString("es-PE", {
                              minimumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {currencySymbol}{" "}
                            {item.total.toLocaleString("es-PE", {
                              minimumFractionDigits: 2,
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}

          {/* Estado SUNAT */}
          <Separator />
          <div className="space-y-3">
            <h3 className="font-semibold">Estado SUNAT</h3>
            <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                {document.aceptada_por_sunat === true ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">
                      Aceptado por SUNAT
                    </span>
                  </>
                ) : document.aceptada_por_sunat === false ? (
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
        </div>
      </GeneralSheet>
    </>
  );
}
