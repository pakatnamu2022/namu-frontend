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
  CheckCircle2,
  XCircle,
  Car,
  Wallet,
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
          <p className="text-sm text-muted-foreground">
            {typeof request.employee === "string"
              ? request.employee
              : request.employee?.full_name || "Sin nombre"}
          </p>
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
          <p className="text-sm text-muted-foreground">
            {request.district.name}
          </p>
        </div>
      </div>

      {/* Empresa */}
      <div className="flex items-start gap-3">
        <Building2 className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium">Empresa</p>
          <p className="text-sm text-muted-foreground">
            {request.company.name}
          </p>
        </div>
      </div>

      {/* Con Activo */}
      <div className="flex items-start gap-3">
        {request.with_active ? (
          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
        ) : (
          <XCircle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
        )}
        <div>
          <p className="text-sm font-medium">Movilidad</p>
          <Badge
            variant={request.with_active ? "default" : "secondary"}
            className="text-xs"
          >
            {request.with_active
              ? "Con activo de la empresa"
              : "Movilidad externa"}
          </Badge>
        </div>
      </div>

      {/* Con Solicitud */}
      <div className="flex items-start gap-3">
        {request.with_request ? (
          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
        ) : (
          <XCircle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
        )}
        <div>
          <p className="text-sm font-medium">Modo</p>
          <Badge
            variant={request.with_request ? "default" : "secondary"}
            className="text-xs"
          >
            {request.with_request ? "Solicita Viáticos" : "Rinde Gastos"}
          </Badge>
        </div>
      </div>

      {/* Movilidad - Activo de Empresa */}
      <div className="flex items-start gap-3">
        <Car className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium">Movilidad</p>
          <div className="flex items-center gap-2">
            <Badge
              variant={request.with_active ? "default" : "outline"}
              className="text-xs"
            >
              {request.with_active ? "Activo de empresa" : "Sin activo"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Presupuesto */}
      <div className="flex items-start gap-3">
        <Wallet className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium">Tipo de Solicitud</p>
          <div className="flex items-center gap-2">
            <Badge
              variant={request.with_request ? "default" : "outline"}
              className="text-xs"
            >
              {request.with_request ? "Solicita presupuesto" : "Rinde gastos"}
            </Badge>
          </div>
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
        (request.approvals && request.approvals.length > 0) ||
        request.notes) && <div className="md:col-span-2 border-t pt-3 -mt-1" />}

      {/* Reserva de Hotel */}
      {request.hotel_reservation && (
        <div className="flex items-start gap-3 md:col-span-2 -mt-3">
          <Hotel className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium mb-2">Reserva de Hotel</p>
            <div className="bg-muted/50 rounded-md p-3 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Hotel</p>
                  <p className="text-sm font-medium">
                    {request.hotel_reservation.hotel_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Teléfono
                  </p>
                  <p className="text-sm">{request.hotel_reservation.phone}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-0.5">
                  Dirección
                </p>
                <p className="text-sm">{request.hotel_reservation.address}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Check-in
                  </p>
                  <p className="text-sm">
                    {format(
                      new Date(request.hotel_reservation.checkin_date),
                      "dd/MM/yyyy"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Check-out
                  </p>
                  <p className="text-sm">
                    {format(
                      new Date(request.hotel_reservation.checkout_date),
                      "dd/MM/yyyy"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Noches</p>
                  <p className="text-sm font-medium">
                    {request.hotel_reservation.nights_count}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* <div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Costo Total
                  </p>
                  <p className="text-sm font-medium">
                    S/ {request.hotel_reservation.total_cost.toFixed(2)}
                  </p>
                </div> */}
                {request.hotel_reservation.penalty > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Penalidad
                    </p>
                    <p className="text-sm font-medium text-red-600">
                      S/ {request.hotel_reservation.penalty.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              {request.hotel_reservation.notes && (
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Notas</p>
                  <p className="text-sm">{request.hotel_reservation.notes}</p>
                </div>
              )}

              {/* <div className="flex items-center gap-2 pt-2 border-t">
                <div
                  className={`px-2 py-1 rounded-md text-xs font-medium ${
                    request.hotel_reservation.attended
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}
                >
                  {request.hotel_reservation.attended
                    ? "Asistido"
                    : "Pendiente de asistir"}
                </div>
              </div> */}
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
          <p className="text-sm font-medium mb-2">Aprovaciones</p>
          {request.approvals && request.approvals.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {request.approvals.map((approval, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs flex flex-col items-start"
                >
                  <p>{approval.approver?.full_name || "Sin nombre"}</p>
                  {/* <p className="text-muted-foreground">{approval.status}</p> */}
                  <p className="text-muted-foreground font-light">
                    {approval.approved_at?.split("T")[0]}
                  </p>
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
