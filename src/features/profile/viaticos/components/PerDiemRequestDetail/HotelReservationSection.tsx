import { format } from "date-fns";
import { Hotel, Phone, MapPin, Moon, CalendarCheck, FileText, Unlock } from "lucide-react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import type { PerDiemRequestResource } from "../../lib/perDiemRequest.interface";

interface HotelReservationSectionProps {
  request: PerDiemRequestResource;
  onRelease?: () => void;
  isReleasing?: boolean;
}

export default function HotelReservationSection({
  request,
  onRelease,
  isReleasing = false,
}: HotelReservationSectionProps) {
  if (!request.hotel_reservation) return null;

  const hr = request.hotel_reservation;

  return (
    <GroupFormSection
      title="Reserva de Hotel"
      icon={Hotel}
      cols={{ sm: 1, md: 3 }}
      gap="gap-3 md:gap-4"
    >
      {/* Hotel */}
      <div className="flex items-start gap-3">
        <Hotel className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
        <div>
          <p className="text-xs md:text-sm font-medium">Hotel</p>
          <p className="text-xs md:text-sm text-muted-foreground">
            {hr.hotel_name}
          </p>
        </div>
      </div>

      {/* Teléfono */}
      <div className="flex items-start gap-3">
        <Phone className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
        <div>
          <p className="text-xs md:text-sm font-medium">Teléfono</p>
          <p className="text-xs md:text-sm text-muted-foreground">{hr.phone}</p>
        </div>
      </div>

      {/* Dirección */}
      <div className="flex items-start gap-3">
        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
        <div>
          <p className="text-xs md:text-sm font-medium">Dirección</p>
          <p className="text-xs md:text-sm text-muted-foreground">
            {hr.address}
          </p>
        </div>
      </div>

      {/* Noches */}
      <div className="flex items-start gap-3">
        <Moon className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
        <div>
          <p className="text-xs md:text-sm font-medium">Noches</p>
          <p className="text-xs md:text-sm font-semibold">
            {hr.nights_count}
          </p>
        </div>
      </div>

      {/* Check-in / Check-out agrupados */}
      <div className="md:col-span-2">
        <div className="bg-muted/50 rounded-md border border-muted p-3 grid grid-cols-2 gap-4">
          <div className="flex items-start gap-2">
            <CalendarCheck className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Check-in</p>
              <p className="text-xs md:text-sm font-medium">
                {format(new Date(hr.checkin_date), "dd/MM/yyyy")}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CalendarCheck className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Check-out</p>
              <p className="text-xs md:text-sm font-medium">
                {format(new Date(hr.checkout_date), "dd/MM/yyyy")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notas */}
      {hr.notes && (
        <div className="flex items-start gap-3 md:col-span-3">
          <FileText className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-xs md:text-sm font-medium">Notas</p>
            <p className="text-xs md:text-sm text-muted-foreground">
              {hr.notes}
            </p>
          </div>
        </div>
      )}

      {/* Acción: Liberar hotel */}
      {onRelease &&
        !hr.attended &&
        (request.status === "in_progress" || request.status === "approved") && (
          <div className="md:col-span-3 flex justify-end pt-2 border-t border-muted">
            <ConfirmationDialog
              trigger={
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  disabled={isReleasing}
                >
                  <Unlock className="h-4 w-4 shrink-0" />
                  <span>{isReleasing ? "Liberando..." : "Liberar hotel"}</span>
                </Button>
              }
              title="¿Liberar reserva de hotel?"
              description={`Esta acción eliminará la reserva de hotel "${hr.hotel_name}" y su gasto vinculado. Una vez liberada, la solicitud podrá ser cancelada. Esta acción no se puede deshacer.`}
              confirmText="Sí, liberar hotel"
              cancelText="No, mantener"
              onConfirm={onRelease}
              variant="destructive"
              icon="warning"
            />
          </div>
        )}
    </GroupFormSection>
  );
}
