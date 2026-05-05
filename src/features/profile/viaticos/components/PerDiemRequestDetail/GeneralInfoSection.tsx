import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar,
  MapPin,
  Target,
  User,
  CalendarClock,
  Bus,
  Car,
  UserCheck,
} from "lucide-react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import type { PerDiemRequestResource } from "../../lib/perDiemRequest.interface";
import { Badge } from "@/components/ui/badge";

interface GeneralInfoSectionProps {
  request: PerDiemRequestResource;
}

const approvalStatusMap = {
  approved: { label: "Aprobado", color: "green" as const },
  rejected: { label: "Rechazado", color: "red" as const },
  pending: { label: "Pendiente", color: "yellow" as const },
};

export default function GeneralInfoSection({
  request,
}: GeneralInfoSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
      {/* Información General */}
      <div className="lg:col-span-2">
        <GroupFormSection
          title="Información General"
          icon={Calendar}
          cols={{ sm: 1, md: 2 }}
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
                  {format(new Date(request.start_date), "PP", {
                    locale: es,
                  })}
                </Badge>
                <span className="text-xs text-muted-foreground">hasta</span>
                <Badge variant="outline" className="text-xs">
                  <CalendarClock className="h-3 w-3 mr-1" />
                  {format(new Date(request.end_date), "PP", { locale: es })}
                </Badge>
                <Badge color="emerald" className="text-xs">
                  {request.days_count}{" "}
                  {request.days_count === 1 ? "día" : "días"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Destino */}
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs md:text-sm font-medium">Destino</p>
              <p className="text-xs md:text-sm text-muted-foreground uppercase">
                {request.company.name} -{request.district.name}
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
                {request.with_active
                  ? "Activo de empresa"
                  : "Movilidad externa"}
              </Badge>
            </div>
          </div>

          {/* Propósito */}
          <div className="flex items-start gap-3 md:col-span-3">
            <Target className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-xs md:text-sm font-medium">
                Propósito del Viaje
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">
                {request.purpose}
              </p>
            </div>
          </div>
        </GroupFormSection>
      </div>

      {/* Aprobaciones */}
      <div className="lg:col-span-1 h-full">
        <GroupFormSection
          title="Aprobaciones"
          icon={UserCheck}
          cols={{ sm: 1, md: 1 }}
          gap="gap-2"
          className="h-full"
        >
          {request.approvals && request.approvals.length > 0 ? (
            request.approvals.map((approval) => {
              const { label, color } =
                approvalStatusMap[approval.status] ?? approvalStatusMap.pending;
              return (
                <div
                  key={approval.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-muted bg-muted/30 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm font-medium truncate">
                      {approval.approver?.full_name || "Sin nombre"}
                    </p>
                    {approval.comments && (
                      <p className="text-xs text-muted-foreground truncate">
                        {approval.comments}
                      </p>
                    )}
                    {approval.approved_at && (
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(approval.approved_at), "PPP", {
                          locale: es,
                        })}
                      </p>
                    )}
                  </div>
                  <Badge color={color} className="text-xs shrink-0">
                    {label}
                  </Badge>
                </div>
              );
            })
          ) : (
            <p className="text-xs md:text-sm text-muted-foreground">
              Sin aprobadores asignados
            </p>
          )}
        </GroupFormSection>
      </div>
    </div>
  );
}
