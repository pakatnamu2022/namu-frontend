import { Badge } from "@/components/ui/badge";
import {
  Target,
  User,
  Package,
  Briefcase,
  Activity,
  UserCircle2,
  MessageSquare,
} from "lucide-react";
import { OpportunityResource } from "../../oportunidades/lib/opportunities.interface";

interface OpportunityInfoCardProps {
  opportunity: OpportunityResource;
}

const getStatusVariant = (
  status: string
): "default" | "secondary" | "destructive" | "outline" => {
  const statusUpper = status.toUpperCase();
  if (statusUpper.includes("GANADA") || statusUpper.includes("CALIENTE"))
    return "default";
  if (statusUpper.includes("PERDIDA")) return "destructive";
  if (statusUpper.includes("TEMPLADA")) return "secondary";
  return "outline";
};

const getClientStatusVariant = (
  status: string
): "default" | "secondary" | "outline" => {
  const statusUpper = status.toUpperCase();
  if (statusUpper.includes("LISTO")) return "default";
  if (statusUpper.includes("NEGOCIACIÓN")) return "secondary";
  return "outline";
};

export const OpportunityInfoCard = ({
  opportunity,
}: OpportunityInfoCardProps) => {
  return (
    <div className="relative overflow-hidden rounded-xl border-primary/30 bg-white shadow-md">
      {/* Header con borde de color */}
      <div className="border-l-4 border-primary bg-linear-to-r from-primary/10 to-primary/2 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10">
              <Target className="size-4 text-primary" />
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
              variant={getStatusVariant(opportunity.opportunity_status)}
              className="text-xs shadow-sm"
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
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                  <User className="size-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                    Cliente
                  </p>
                  <p className="text-sm font-bold text-slate-900 truncate">
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
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <Package className="size-4 text-primary" />
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
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-slate-200 bg-slate-50/30 px-3 py-2 text-xs">
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
            <span className="text-slate-600">Tipo:</span>
            <span className="font-semibold text-slate-900">
              {opportunity.opportunity_type}
            </span>
          </div>
          {opportunity.actions && opportunity.actions.length > 0 && (
            <>
              <div className="h-3 w-px bg-slate-300" />
              <div className="flex items-center gap-1.5">
                <Activity className="size-3.5 text-primary" />
                <span className="font-semibold text-primary">
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
