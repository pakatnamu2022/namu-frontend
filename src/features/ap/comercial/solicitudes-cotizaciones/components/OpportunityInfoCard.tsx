import { Badge } from "@/components/ui/badge";
import {
  Target,
  User,
  Package,
  Briefcase,
  Activity,
  UserCircle2,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { OpportunityResource } from "../../oportunidades/lib/opportunities.interface";
import { cn } from "@/lib/utils";

interface OpportunityInfoCardProps {
  opportunity: OpportunityResource;
}

const getClientStatusVariant = (
  status: string
): "default" | "secondary" | "outline" => {
  const statusUpper = status.toUpperCase();
  if (statusUpper.includes("LISTO")) return "default";
  if (statusUpper.includes("NEGOCIACIÓN")) return "secondary";
  return "outline";
};

// Función para obtener los colores según el estado
const getStatusColors = (status: string) => {
  const statusUpper = status.toUpperCase();

  if (statusUpper.includes("GANADA")) {
    return {
      border: "border-green-500",
      bg: "from-green-100 to-green-100/2",
      bgIcon: "bg-green-100",
      textIcon: "text-green-600",
      bgBadge: "bg-green-50",
      textBadge: "text-green-700",
      bgText: "bg-green-50",
    };
  }

  if (statusUpper.includes("CALIENTE")) {
    return {
      border: "border-orange-500",
      bg: "from-orange-100 to-orange-100/2",
      bgIcon: "bg-orange-100",
      textIcon: "text-orange-600",
      bgBadge: "bg-orange-50",
      textBadge: "text-orange-700",
      bgText: "bg-orange-50",
    };
  }

  if (statusUpper.includes("TEMPLADA")) {
    return {
      border: "border-amber-500",
      bg: "from-amber-100 to-amber-100/2",
      bgIcon: "bg-amber-100",
      textIcon: "text-amber-600",
      bgBadge: "bg-amber-50",
      textBadge: "text-amber-700",
      bgText: "bg-amber-50",
    };
  }

  if (statusUpper.includes("FRIO")) {
    return {
      border: "border-blue-500",
      bg: "from-blue-100 to-blue-100/2",
      bgIcon: "bg-blue-100",
      textIcon: "text-blue-600",
      bgBadge: "bg-blue-50",
      textBadge: "text-blue-700",
      bgText: "bg-blue-50",
    };
  }

  if (statusUpper.includes("PERDIDA")) {
    return {
      border: "border-red-500",
      bg: "from-red-100 to-red-100/2",
      bgIcon: "bg-red-100",
      textIcon: "text-red-600",
      bgBadge: "bg-red-50",
      textBadge: "text-red-700",
      bgText: "bg-red-50",
    };
  }

  // Default (primary)
  return {
    border: "border-primary",
    bg: "from-primary/10 to-primary/2",
    bgIcon: "bg-primary/10",
    textIcon: "text-primary",
    bgBadge: "bg-primary/10",
    textBadge: "text-primary",
    bgText: "bg-primary/10",
  };
};

export const OpportunityInfoCard = ({
  opportunity,
}: OpportunityInfoCardProps) => {
  const colors = getStatusColors(opportunity.opportunity_status);

  return (
    <div className="relative overflow-hidden rounded-xl border-primary/30 bg-white shadow-md">
      {/* Header con borde de color */}
      <div
        className={cn(
          "border-l-4 px-4 py-3 bg-linear-to-r",
          colors.bg,
          colors.border
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-9 items-center justify-center rounded-full",
                colors.bgIcon
              )}
            >
              <Target className={cn("size-4", colors.textIcon)} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                Oportunidad #{opportunity.id}
              </h3>
              <p className="text-xs text-muted-foreground">
                Información del proceso comercial
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              className={cn(
                "text-xs shadow-sm",
                colors.bgBadge,
                colors.textBadge
              )}
            >
              {opportunity.opportunity_status}
            </Badge>
            {opportunity.is_closed && (
              <Badge variant="destructive" className="text-xs shadow-sm">
                Cerrada
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Cliente y Vehículo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Cliente */}
          <div className="group relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50/50 p-3 transition-all hover:shadow-sm">
            <div className="absolute right-0 top-0 h-full w-1" />
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg",
                    colors.bgIcon
                  )}
                >
                  <User className={cn("size-4", colors.textIcon)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                    Cliente
                  </p>
                  <p className="text-sm font-bold text-slate-900 text-wrap">
                    {opportunity.client.full_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {opportunity.client.num_doc}
                  </p>
                </div>
              </div>
              <Badge
                variant={getClientStatusVariant(opportunity.client_status)}
                className="text-[10px] h-5 shrink-0"
              >
                {opportunity.client_status}
              </Badge>
            </div>
          </div>

          {/* Vehículo */}
          <div className="group relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50/50 p-3 transition-all hover:shadow-sm">
            <div className="absolute right-0 top-0 h-full w-1" />
            <div className="flex items-start gap-2">
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg",
                  colors.bgIcon
                )}
              >
                <Package className={cn("size-4", colors.textIcon)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                  Vehículo de Interés
                </p>
                <p className="text-sm font-bold text-slate-900 truncate">
                  {opportunity.family.brand} {opportunity.family.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info adicional */}
        <div
          className={cn(
            "flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border px-3 py-2 text-xs",
            colors.bgText
          )}
        >
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5 text-slate-500" />
            <span className="text-slate-600">Creada:</span>
            <span className="font-semibold text-slate-900">
              {new Date(opportunity.created_at).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="h-3 w-px bg-slate-300" />
          <div className="flex items-center gap-1.5">
            <UserCircle2 className="size-3.5 text-slate-500" />
            <span className="text-slate-600">Asesor:</span>
            <span className="font-semibold text-slate-900">
              {opportunity.worker.name}
            </span>
          </div>
          <div className="h-3 w-px bg-slate-300" />
          <div className="flex items-center gap-1.5">
            <Briefcase className="size-3.5 text-slate-500" />
            <span className="font-semibold text-slate-900">
              {opportunity.lead.type}
            </span>
          </div>
          {opportunity.actions && opportunity.actions.length > 0 && (
            <>
              <div className="h-3 w-px bg-slate-300" />
              <div className="flex items-center gap-1.5">
                <Activity className={cn("size-3.5", colors.textIcon)} />
                <span className={cn("font-semibold", colors.textIcon)}>
                  {opportunity.actions.length}
                </span>
                <span className="text-slate-600">
                  {opportunity.actions.length === 1 ? "acción" : "acciones"}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Comentario */}
        {opportunity.comment && (
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
            <div className="flex items-start gap-2">
              <MessageSquare className="size-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-900 mb-1">
                  Comentario
                </p>
                <p className="text-xs text-slate-700 italic leading-relaxed">
                  "{opportunity.comment}"
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
