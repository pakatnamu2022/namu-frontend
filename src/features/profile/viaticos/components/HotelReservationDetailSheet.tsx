import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Hotel,
  MapPin,
  Phone,
  Calendar,
  Moon,
  DollarSign,
  FileText,
  AlertCircle,
  Receipt,
  Pencil,
} from "lucide-react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import GeneralSheet from "@/shared/components/GeneralSheet";
import type { HotelReservationResource } from "@/features/profile/viaticos/lib/perDiemRequest.interface";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface HotelReservationDetailSheetProps {
  hotelReservation: HotelReservationResource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId?: number;
  module?: "gh" | "contabilidad";
}

export default function HotelReservationDetailSheet({
  hotelReservation,
  open,
  onOpenChange,
  requestId,
  module = "gh",
}: HotelReservationDetailSheetProps) {
  const navigate = useNavigate();

  if (!hotelReservation) return null;

  const handleEdit = () => {
    const prefix =
      module === "gh"
        ? "/gp/gestion-humana/viaticos/solicitud-viaticos"
        : "/ap/contabilidad/viaticos-ap";
    navigate(
      `${prefix}/${requestId}/reserva-hotel/actualizar/${hotelReservation.id}`
    );
  };

  const getFileExtension = (path: string) => {
    return path.split(".").pop()?.toLowerCase();
  };

  const isPDF = (path: string) => {
    return getFileExtension(path) === "pdf";
  };

  const isImage = (path: string) => {
    const ext = getFileExtension(path);
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "");
  };

  return (
    <GeneralSheet
      open={open}
      onClose={() => onOpenChange(false)}
      title="Reserva de Hotel"
      subtitle="Detalles completos de la reserva hotelera"
      icon="Hotel"
      size="3xl"
      className="overflow-y-auto"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            {hotelReservation.attended && (
              <Badge color="default" className="gap-1">
                Asistido
              </Badge>
            )}
          </div>
          {requestId && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="gap-2"
            >
              <Pencil className="h-4 w-4" />
              Editar Reserva
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {/* Información del Hotel */}
          <GroupFormSection
            title="Información del Hotel"
            icon={Hotel}
            cols={{ sm: 1, md: 2 }}
          >
            <div className="flex items-start gap-3 md:col-span-2">
              <Hotel className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Nombre del Hotel
                </p>
                <p className="text-base font-semibold">
                  {hotelReservation.hotel_name}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 md:col-span-2">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Dirección
                </p>
                <p className="text-sm">{hotelReservation.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Teléfono
                </p>
                <p className="text-sm">{hotelReservation.phone}</p>
              </div>
            </div>
          </GroupFormSection>

          <Separator />

          {/* Detalles de la Estadía */}
          <GroupFormSection
            title="Detalles de la Estadía"
            icon={Calendar}
            cols={{ sm: 1, md: 3 }}
          >
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Check-in
                </p>
                <p className="text-sm font-semibold">
                  {format(
                    new Date(hotelReservation.checkin_date),
                    "dd/MM/yyyy",
                    { locale: es }
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Check-out
                </p>
                <p className="text-sm font-semibold">
                  {format(
                    new Date(hotelReservation.checkout_date),
                    "dd/MM/yyyy",
                    { locale: es }
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Moon className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Noches
                </p>
                <p className="text-sm font-semibold">
                  {hotelReservation.nights_count}{" "}
                  {hotelReservation.nights_count === 1 ? "noche" : "noches"}
                </p>
              </div>
            </div>
          </GroupFormSection>

          <Separator />

          {/* Información Financiera */}
          <GroupFormSection
            title="Información Financiera"
            icon={DollarSign}
            cols={{ sm: 1, md: 2 }}
          >
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Costo Total
                </p>
                <p className="text-lg font-bold text-primary">
                  S/ {hotelReservation.total_cost.toFixed(2)}
                </p>
              </div>
            </div>

            {hotelReservation.penalty > 0 && (
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Penalidad
                  </p>
                  <p className="text-lg font-bold text-red-600">
                    S/ {hotelReservation.penalty.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </GroupFormSection>

          {/* Notas */}
          {hotelReservation.notes && (
            <>
              <Separator />
              <GroupFormSection
                title="Notas Adicionales"
                icon={FileText}
                cols={{ sm: 1 }}
              >
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      {hotelReservation.notes}
                    </p>
                  </div>
                </div>
              </GroupFormSection>
            </>
          )}

          <Separator />

          {/* Comprobante/Recibo */}
          <GroupFormSection
            title="Comprobante de Pago"
            icon={Receipt}
            cols={{ sm: 1 }}
          >
            <div className="flex items-start gap-3">
              <Receipt className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  Archivo adjunto
                </p>
                <Card className="p-4">
                  {isPDF(hotelReservation.receipt_path) ? (
                    <div className="space-y-2">
                      <embed
                        src={hotelReservation.receipt_path}
                        type="application/pdf"
                        className="w-full h-[600px] rounded-md"
                      />
                      <a
                        href={hotelReservation.receipt_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-2"
                      >
                        <Receipt className="h-4 w-4" />
                        Abrir PDF en nueva pestaña
                      </a>
                    </div>
                  ) : isImage(hotelReservation.receipt_path) ? (
                    <div className="space-y-2">
                      <img
                        src={hotelReservation.receipt_path}
                        alt="Comprobante de reserva de hotel"
                        className="w-full h-auto rounded-md"
                      />
                      <a
                        href={hotelReservation.receipt_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-2"
                      >
                        <Receipt className="h-4 w-4" />
                        Abrir imagen en nueva pestaña
                      </a>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Formato de archivo no soportado para vista previa
                      </p>
                      <a
                        href={hotelReservation.receipt_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline mt-2 inline-block"
                      >
                        Descargar archivo
                      </a>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </GroupFormSection>

          {/* Información de Registro */}
          <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
            <p>
              Creado:{" "}
              {format(
                new Date(hotelReservation.created_at),
                "dd/MM/yyyy HH:mm",
                {
                  locale: es,
                }
              )}
            </p>
            <p>
              Última actualización:{" "}
              {format(
                new Date(hotelReservation.updated_at),
                "dd/MM/yyyy HH:mm",
                {
                  locale: es,
                }
              )}
            </p>
          </div>
        </div>
      </div>
    </GeneralSheet>
  );
}
