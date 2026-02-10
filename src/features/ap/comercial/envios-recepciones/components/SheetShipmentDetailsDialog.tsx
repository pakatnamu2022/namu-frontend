import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ShipmentsReceptionsResource } from "../lib/shipmentsReceptions.interface";
import {
  useShipmentsReceptionsById,
  useReceptionChecklistById,
} from "../lib/shipmentsReceptions.hook";
import {
  FileText,
  Download,
  QrCode,
  FileCode,
  Truck,
  Package,
  MapPin,
  FileCheck,
  CheckCircle,
  XCircle,
  Clock,
  ListChecks,
  Wrench,
} from "lucide-react";
import { Link } from "react-router-dom";
import GeneralSheet from "@/shared/components/GeneralSheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ShipmentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shipment: ShipmentsReceptionsResource | null;
}

export function SheetShipmentDetailsDialog({
  open,
  onOpenChange,
  shipment: initialShipment,
}: ShipmentDetailsDialogProps) {
  const shipmentId = initialShipment?.id || 0;

  const { data: shipment } = useShipmentsReceptionsById(shipmentId);
  const { data: receptionData } = useReceptionChecklistById(shipmentId);

  if (!initialShipment || !shipment) return null;

  const documentTypeConfig = {
    GUIA_REMISION: {
      label: "Guía de Remisión",
      className: "bg-blue-100 text-blue-700 border-blue-300",
    },
    GUIA_TRASLADO: {
      label: "Guía de Traslado",
      className: "bg-purple-100 text-purple-700 border-purple-300",
    },
  };

  const docType =
    documentTypeConfig[
      shipment.document_type as keyof typeof documentTypeConfig
    ];

  const sunatStatusConfig = {
    accepted: {
      label: "Aceptado por SUNAT",
      icon: CheckCircle,
      className: "text-green-600",
    },
    rejected: {
      label: "Rechazado por SUNAT",
      icon: XCircle,
      className: "text-red-600",
    },
    pending: {
      label: "Pendiente de envío",
      icon: Clock,
      className: "text-muted-foreground",
    },
  };

  const getSunatStatus = (): keyof typeof sunatStatusConfig | null => {
    if (!shipment.requires_sunat) return null;
    if (shipment.aceptada_por_sunat === true) return "accepted";
    if (shipment.aceptada_por_sunat === false) return "rejected";
    return "pending";
  };

  const sunatStatus = getSunatStatus();
  const sunatConfig = sunatStatus ? sunatStatusConfig[sunatStatus] : null;
  const SunatIcon = sunatConfig?.icon;

  return (
    <GeneralSheet
      open={open}
      onClose={() => onOpenChange(false)}
      title={`Detalle de Guía - ${shipment.document_number}`}
      subtitle="Información completa de la guía de envío incluyendo transporte, origen/destino y estado SUNAT."
      icon="Truck"
      size="5xl"
    >
      <div className="mt-6 space-y-6">
        {/* Tipo de Documento y Estado SUNAT */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Tipo de Documento</p>
            <Badge variant="outline" className={`${docType?.className} w-fit`}>
              {docType?.label || shipment.document_type}
            </Badge>
          </div>
          {sunatConfig && SunatIcon && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Estado SUNAT</p>
              <div className="flex items-center gap-1">
                <SunatIcon className={`h-4 w-4 ${sunatConfig.className}`} />
                <span
                  className={`text-sm font-medium ${sunatConfig.className}`}
                >
                  {sunatConfig.label}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Archivos Disponibles */}
        {shipment.requires_sunat &&
          shipment.is_sunat_registered &&
          (shipment.enlace_del_pdf ||
            shipment.enlace_del_xml ||
            shipment.enlace_del_cdr ||
            shipment.cadena_para_codigo_qr) && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold">Archivos Disponibles</h3>
                <div className="flex flex-wrap gap-2">
                  {shipment.enlace_del_pdf && (
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        to={shipment.enlace_del_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Ver PDF
                      </Link>
                    </Button>
                  )}
                  {shipment.enlace_del_xml && (
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        to={shipment.enlace_del_xml}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileCode className="h-4 w-4 mr-2" />
                        Descargar XML
                      </Link>
                    </Button>
                  )}
                  {shipment.enlace_del_cdr && (
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        to={shipment.enlace_del_cdr}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Descargar CDR
                      </Link>
                    </Button>
                  )}
                  {shipment.cadena_para_codigo_qr && (
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        to={shipment.cadena_para_codigo_qr}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <QrCode className="h-4 w-4 mr-2" />
                        Ver QR
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}

        <Separator />

        {/* Información General */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Información General</h3>
          </div>
          <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">
                  Número de Documento
                </p>
                <p className="text-sm font-medium">
                  {shipment.document_number}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tipo de Emisor</p>
                <p className="text-sm font-medium">{shipment.issuer_type}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Fecha de Emisión
                </p>
                <p className="text-sm font-medium">
                  {shipment.issue_date
                    ? new Date(shipment.issue_date).toLocaleDateString(
                        "es-PE",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        },
                      )
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Motivo de Traslado
                </p>
                <p className="text-sm font-medium">
                  {shipment.transfer_reason_description || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Modalidad de Transporte
                </p>
                <p className="text-sm font-medium">
                  {shipment.transfer_modality_description || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Información de Transporte */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Información de Transporte</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 bg-muted/30 p-4 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">Placa</p>
              <p className="text-sm font-semibold">{shipment.plate}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Conductor</p>
              <p className="text-sm font-medium">
                {shipment.driver_name || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Licencia</p>
              <p className="text-sm font-medium">{shipment.license || "-"}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Origen y Destino */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Origen y Destino</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
                Origen
              </p>
              <p className="text-sm font-semibold">
                {shipment.transmitter_name || shipment.sede_transmitter}
              </p>
              {shipment.transmitter_establishment?.description && (
                <p className="text-xs text-primary mt-1">
                  {shipment.transmitter_establishment.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {shipment.transmitter_establishment?.full_address ||
                  shipment.transmitter_description ||
                  "-"}
              </p>
            </div>
            <div className="p-4 rounded-lg border border-secondary/30 bg-secondary/5">
              <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2">
                Destino
              </p>
              <p className="text-sm font-semibold">{shipment.receiver_name}</p>
              {shipment.receiver_establishment?.description && (
                <p className="text-xs text-secondary mt-1">
                  {shipment.receiver_establishment.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {shipment.receiver_establishment?.full_address ||
                  shipment.receiver_description ||
                  "-"}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Información de Carga */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Información de Carga</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">Total de Paquetes</p>
              <p className="text-sm font-semibold">{shipment.total_packages}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Peso Total</p>
              <p className="text-sm font-semibold">
                {shipment.total_weight} kg
              </p>
            </div>
          </div>
        </div>

        {/* Detalle de la Guía - Items */}
        {shipment.items && shipment.items.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">
                  Detalle de la Guía ({shipment.items.length})
                </h3>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Código</TableHead>
                      <TableHead className="text-right">Descripción</TableHead>
                      <TableHead className="text-right">Unidad</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shipment.items.map((item) => (
                      <TableRow key={item.codigo}>
                        <TableCell className="text-sm">{item.codigo}</TableCell>
                        <TableCell className="text-right text-sm font-medium">
                          {item.descripcion}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {item.unidad}
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold">
                          {item.cantidad}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        )}

        {/* Checklist de Recepción */}
        {receptionData && receptionData.data.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">
                  Checklist de Recepción ({receptionData.data.length})
                </h3>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-center">Cant.</TableHead>
                      <TableHead className="text-center w-20">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receptionData.data.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-sm">
                          {item.receiving_description}
                        </TableCell>
                        <TableCell className="text-center text-sm font-medium">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.quantity > 0 ? (
                            <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground mx-auto" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        )}

        {/* Accesorios */}
        {receptionData && receptionData.accessories.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Accesorios Incluidos</h3>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Descripción</TableHead>
                      <TableHead className="text-right">Cant.</TableHead>
                      <TableHead className="text-right">Unidad</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receptionData.accessories.map((accessory) => (
                      <TableRow key={accessory.id}>
                        <TableCell className="text-sm">
                          {accessory.description}
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium">
                          {accessory.quantity}
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {accessory.unit_measurement}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        )}

        {/* Notas */}
        {(shipment.notes || receptionData?.note_received) && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="font-semibold">Notas</h3>
              <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                {shipment.notes && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Nota de Guía
                    </p>
                    <p className="text-sm">{shipment.notes}</p>
                  </div>
                )}
                {shipment.notes && receptionData?.note_received && (
                  <Separator />
                )}
                {receptionData?.note_received && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Nota de Recepción
                    </p>
                    <p className="text-sm">{receptionData.note_received}</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </GeneralSheet>
  );
}
