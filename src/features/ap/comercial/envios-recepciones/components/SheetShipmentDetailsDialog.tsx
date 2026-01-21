import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShipmentsReceptionsResource } from "../lib/shipmentsReceptions.interface";
import {
  useShipmentsReceptionsById,
  useReceptionChecklistById,
} from "../lib/shipmentsReceptions.hook";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  FileText,
  Download,
  QrCode,
  FileCode,
  Truck,
  Calendar,
  Package,
  MapPin,
  FileCheck,
  Building2,
  ClipboardList,
  CheckCircle2,
  XCircle,
  ListChecks,
  Wrench,
} from "lucide-react";
import { Link } from "react-router-dom";

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

  // Consultar datos completos desde la BD
  const { data: shipment } = useShipmentsReceptionsById(shipmentId);
  const { data: receptionData } = useReceptionChecklistById(shipmentId);

  if (!initialShipment || !shipment) return null;

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
            Detalles de la Guía
          </SheetTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {shipment.document_number}
          </p>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Información General */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-blue-50/50 rounded-lg border border-blue-100">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <FileText className="size-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Tipo de Documento
                  </p>
                  <Badge
                    color={
                      shipment.document_type === "GUIA_REMISION"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {shipment.document_type === "GUIA_REMISION"
                      ? "Guía Remisión"
                      : "Guía Traslado"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <FileCheck className="size-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Número de Documento
                  </p>
                  <p className="text-base font-semibold">
                    {shipment.document_number}
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
                    {shipment.issue_date
                      ? format(new Date(shipment.issue_date), "dd/MM/yyyy", {
                          locale: es,
                        })
                      : "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Building2 className="size-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Tipo de Emisor
                  </p>
                  <Badge variant="outline">{shipment.issuer_type}</Badge>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <ClipboardList className="size-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Motivo de Traslado
                  </p>
                  <p className="text-base">
                    {shipment.transfer_reason_description}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Truck className="size-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Modalidad de Transporte
                  </p>
                  <p className="text-base">
                    {shipment.transfer_modality_description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Información de Transporte */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Truck className="size-5" />
              Información de Transporte
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Placa
                </p>
                <p className="text-base font-semibold">{shipment.plate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Conductor
                </p>
                <p className="text-base">{shipment.driver_name || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Licencia
                </p>
                <p className="text-base">{shipment.license || "-"}</p>
              </div>
            </div>
          </div>

          {/* Origen y Destino */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="size-5" />
              Origen y Destino
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Origen */}
              <div className="p-5 bg-linear-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-300 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-primary rounded-lg">
                    <Building2 className="size-4 text-white" />
                  </div>
                  <span className="text-sm font-bold text-primary uppercase tracking-wide">
                    Origen
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-base font-bold text-gray-900">
                    {shipment.transmitter_name || shipment.sede_transmitter}
                  </p>
                  {shipment.transmitter_establishment?.description && (
                    <p className="text-sm font-medium text-primary">
                      {shipment.transmitter_establishment.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {shipment.transmitter_establishment?.full_address ||
                      shipment.transmitter_description}
                  </p>
                </div>
              </div>

              {/* Destino */}
              <div className="p-5 bg-linear-to-br from-red-50 to-red-100 rounded-lg border-2 border-red-300 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-secondary rounded-lg">
                    <Building2 className="size-4 text-white" />
                  </div>
                  <span className="text-sm font-bold text-secondary uppercase tracking-wide">
                    Destino
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-base font-bold text-gray-900">
                    {shipment.receiver_name}
                  </p>
                  {shipment.receiver_establishment?.description && (
                    <p className="text-sm font-medium text-secondary">
                      {shipment.receiver_establishment.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {shipment.receiver_establishment?.full_address ||
                      shipment.receiver_description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Información de Carga */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Package className="size-5" />
              Información de Carga
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-purple-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total de Paquetes
                </p>
                <p className="text-base font-semibold">
                  {shipment.total_packages}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Peso Total
                </p>
                <p className="text-base font-semibold">
                  {shipment.total_weight} kg
                </p>
              </div>
            </div>
          </div>

          {/* Estado SUNAT */}
          {shipment.requires_sunat && (
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
                  {shipment.is_sunat_registered ? (
                    <CheckCircle2 className="size-5 text-green-600" />
                  ) : (
                    <XCircle className="size-5 text-secondary" />
                  )}
                </div>
                {shipment.sent_at && (
                  <div>
                    <span className="text-sm font-medium">
                      Fecha de Envío:{" "}
                    </span>
                    <span className="text-sm">
                      {formatDate(shipment.sent_at)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Aceptado por SUNAT
                  </span>
                  {shipment.aceptada_por_sunat ? (
                    <CheckCircle2 className="size-5 text-green-600" />
                  ) : (
                    <XCircle className="size-5 text-secondary" />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Checklist de Recepción */}
          {receptionData && receptionData.data.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ListChecks className="size-5" />
                Checklist de Recepción
              </h3>
              <div className="p-4 bg-linear-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {receptionData.data.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        item.quantity > 0
                          ? "bg-green-100 border-green-400"
                          : "bg-gray-50 border-gray-300"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-700 wrap-break-word leading-tight">
                            {item.receiving_description}
                          </p>
                          <p
                            className={`text-xs font-semibold mt-1 ${
                              item.quantity > 0
                                ? "text-primary"
                                : "text-gray-500"
                            }`}
                          >
                            Cant: {item.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Accesorios */}
          {receptionData && receptionData.accessories.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Wrench className="size-5" />
                Accesorios Incluidos
              </h3>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {receptionData.accessories.map((accessory) => (
                    <div
                      key={accessory.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-2">
                        <Package className="size-4 text-gray-600" />
                        <span className="text-sm font-medium">
                          {accessory.description}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-700">
                          {accessory.quantity} {accessory.unit_measurement}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notas */}
          {(shipment.notes || receptionData?.note_received) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Notas</h3>
              <div className="space-y-2">
                {shipment.notes && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-700 mb-1">
                      Nota de Guía
                    </p>
                    <p className="text-sm">{shipment.notes}</p>
                  </div>
                )}
                {receptionData?.note_received && (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
                    <p className="text-sm font-medium text-gray-800 mb-1">
                      Nota de Recepción
                    </p>
                    <p className="text-sm">{receptionData.note_received}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Documentos SUNAT */}
          {shipment.requires_sunat && shipment.is_sunat_registered && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Documentos SUNAT</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {shipment.enlace_del_pdf && (
                  <Link
                    to={shipment.enlace_del_pdf}
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

                {shipment.enlace_del_xml && (
                  <Link
                    to={shipment.enlace_del_xml}
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

                {shipment.enlace_del_cdr && (
                  <Link
                    to={shipment.enlace_del_cdr}
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

                {shipment.cadena_para_codigo_qr && (
                  <Link
                    to={shipment.cadena_para_codigo_qr}
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
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
