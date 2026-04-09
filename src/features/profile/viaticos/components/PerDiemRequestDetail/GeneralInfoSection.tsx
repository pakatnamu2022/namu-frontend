import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar,
  MapPin,
  Target,
  User,
  Building2,
  CalendarClock,
  Bus,
  Car,
} from "lucide-react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import type { PerDiemRequestResource } from "../../lib/perDiemRequest.interface";
import { Badge } from "@/components/ui/badge";

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
      cols={{ sm: 1, md: 3 }}
      gap="gap-3 md:gap-4"
      className="h-full"
    >
      {/* Empleado */}
      <div className="flex items-start gap-3">
        <User className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
        <div>
          <p className="text-xs md:text-sm font-medium">Empleado</p>
          <p className="text-xs md:text-sm text-muted-foreground">
            {typeof request.employee === "string"
              ? request.employee
              : request.employee?.full_name || "Sin nombre"}
          </p>
        </div>
      </div>

      {/* Período */}
      <div className="flex items-start gap-3 md:col-span-2">
        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-xs md:text-sm font-medium mb-1">
            Periodo del Viático
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <CalendarClock className="h-3 w-3 mr-1" />
              {format(new Date(request.start_date), "PPP", {
                locale: es,
              })}
            </Badge>
            <span className="text-xs text-muted-foreground">hasta</span>
            <Badge variant="outline" className="text-xs">
              <CalendarClock className="h-3 w-3 mr-1" />
              {format(new Date(request.end_date), "PPP", { locale: es })}
            </Badge>
            <Badge color="emerald" className="text-xs">
              {request.days_count} {request.days_count === 1 ? "día" : "días"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Destino */}
      <div className="flex items-start gap-3">
        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
        <div>
          <p className="text-xs md:text-sm font-medium">Destino</p>
          <p className="text-xs md:text-sm text-muted-foreground">
            {request.district.name}
          </p>
        </div>
      </div>

      {/* Empresa */}
      <div className="flex items-start gap-3">
        <Building2 className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
        <div>
          <p className="text-xs md:text-sm font-medium">Empresa</p>
          <p className="text-xs md:text-sm text-muted-foreground">
            {request.company.name}
          </p>
        </div>
      </div>

      {/* Tipo de Movilidad */}
      <div className="flex items-start gap-3">
        {request.with_active ? (
          <Car className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
        ) : (
          <Bus className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
        )}
        <div>
          <p className="text-xs md:text-sm font-medium">Movilidad</p>
          <Badge
            color={request.with_active ? "blue" : "gray"}
            className="text-xs"
          >
            {request.with_active ? "Activo de empresa" : "Movilidad externa"}
          </Badge>
        </div>
      </div>

      {/* Propósito */}
      <div className="flex items-start gap-3 md:col-span-3">
        <Target className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-xs md:text-sm font-medium">Propósito del Viaje</p>
          <p className="text-xs md:text-sm text-muted-foreground">
            {request.purpose}
          </p>
        </div>
      </div>
    </GroupFormSection>
  );
}
