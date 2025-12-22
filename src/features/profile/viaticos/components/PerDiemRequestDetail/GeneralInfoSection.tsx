import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar,
  MapPin,
  Target,
  User,
  Building2,
  FileText,
  CalendarClock,
  Hotel,
} from "lucide-react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import type { PerDiemRequestResource } from "../../lib/perDiemRequest.interface";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface GeneralInfoSectionProps {
  request: PerDiemRequestResource;
}

export default function GeneralInfoSection({
  request,
}: GeneralInfoSectionProps) {
  return (
    <GroupFormSection
      title="Información General"
      icon={Calendar}
      cols={{ sm: 1, md: 2 }}
      gap="gap-3 md:gap-4"
      className="h-full"
    >
      {/* Código de Solicitud */}
      <div className="flex items-start gap-3">
        <FileText className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium">Código</p>
          <p className="text-sm font-semibold text-primary">{request.code}</p>
        </div>
      </div>

      {/* Empleado */}
      <div className="flex items-start gap-3">
        <User className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium">Empleado</p>
          <p className="text-sm text-muted-foreground">{request.employee}</p>
        </div>
      </div>

      {/* Separador sutil */}
      <div className="md:col-span-2 border-t pt-3 -mt-1" />

      {/* Fechas */}
      <div className="flex items-start gap-3 md:col-span-2 -mt-3">
        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium mb-1">Periodo del Viático</p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <CalendarClock className="h-3 w-3 mr-1" />
              {format(new Date(request.start_date), "dd/MM/yyyy", {
                locale: es,
              })}
            </Badge>
            <span className="text-xs text-muted-foreground">hasta</span>
            <Badge variant="outline" className="text-xs">
              <CalendarClock className="h-3 w-3 mr-1" />
              {format(new Date(request.end_date), "dd/MM/yyyy", { locale: es })}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {request.days_count} {request.days_count === 1 ? "día" : "días"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Destino */}
      <div className="flex items-start gap-3">
        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium">Destino</p>
          <p className="text-sm text-muted-foreground">{request.destination}</p>
        </div>
      </div>

      {/* Empresa */}
      <div className="flex items-start gap-3">
        <Building2 className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium">Empresa</p>
          <p className="text-sm text-muted-foreground">{request.company}</p>
        </div>
      </div>

      {/* Propósito */}
      <div className="flex items-start gap-3 md:col-span-2">
        <Target className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">Propósito del Viaje</p>
          <p className="text-sm text-muted-foreground">{request.purpose}</p>
        </div>
      </div>

      {/* Separador sutil */}
      {(request.hotel_reservation ||
        request.approvals?.length > 0 ||
        request.notes) && <div className="md:col-span-2 border-t pt-3 -mt-1" />}

      {/* Reserva de Hotel */}
      {request.hotel_reservation && (
        <div className="flex items-start gap-3 md:col-span-2 -mt-3">
          <Hotel className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium mb-2">Reserva de Hotel</p>
            <div className="bg-muted/50 rounded-md p-2.5 space-y-1">
              <p className="text-xs text-muted-foreground">
                Se incluye reserva de hotel en esta solicitud
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Aprobadores */}
      <div
        className={cn(
          "flex items-start gap-3 md:col-span-2",
          !request.hotel_reservation && "-mt-3"
        )}
      >
        <User className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium mb-2">Aprobadores</p>
          {request.approvals && request.approvals.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {request.approvals.map((approval, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {approval.approver}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No asignado</p>
          )}
        </div>
      </div>

      {/* Notas */}
      {request.notes && (
        <div className="flex items-start gap-3 md:col-span-2">
          <FileText className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">Notas</p>
            <p className="text-sm text-muted-foreground">{request.notes}</p>
          </div>
        </div>
      )}
    </GroupFormSection>
  );
}
