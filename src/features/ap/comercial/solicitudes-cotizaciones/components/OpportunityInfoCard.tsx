import { Badge, BadgeColor } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Target,
  User,
  Package,
  Briefcase,
  Activity,
  UserCircle2,
  MessageSquare,
  Calendar,
  ArrowRight,
  Pencil,
  X,
} from "lucide-react";
import { OpportunityResource } from "../../oportunidades/lib/opportunities.interface";
import { FamiliesResource } from "@/features/ap/configuraciones/vehiculos/familias/lib/families.interface";
import { useFamilies } from "../../oportunidades/lib/opportunities.hook";
import { SearchableSelectAsync } from "@/shared/components/SearchableSelectAsync";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { CM_COMERCIAL_ID } from "@/features/ap/ap-master/lib/apMaster.constants";

interface OpportunityInfoCardProps {
  opportunity: OpportunityResource;
  onView?: () => void;
  /** Permite editar la familia del vehículo directamente desde esta tarjeta.
   *  Solo debe activarse en la instancia donde tenga sentido reasignarla
   *  (ej. PurchaseRequestQuoteForm), no en todas las que usan esta tarjeta. */
  canEditFamily?: boolean;
  /** Se dispara cuando el usuario confirma un cambio de familia. */
  onFamilyChange?: (familyId: number, family: FamiliesResource) => void;
}

const getClientStatusVariant = (status: string): BadgeColor => {
  const statusUpper = status.toUpperCase();
  if (statusUpper.includes("LISTO")) return "default";
  if (statusUpper.includes("NEGOCIACIÓN")) return "secondary";
  return "default";
};

// Función para obtener los colores según el estado
const getStatusColors = (status: string) => {
  const statusUpper = status.toUpperCase();

  if (statusUpper.includes("GANADA")) {
    return {
      badge: "green" as BadgeColor,
      text: "text-green-600 dark:text-green-400",
    };
  }

  if (statusUpper.includes("CALIENTE")) {
    return {
      badge: "orange" as BadgeColor,
      text: "text-orange-600 dark:text-orange-400",
    };
  }

  if (statusUpper.includes("TEMPLADA")) {
    return {
      badge: "amber" as BadgeColor,
      text: "text-amber-600 dark:text-amber-400",
    };
  }

  if (statusUpper.includes("FRIO")) {
    return {
      badge: "blue" as BadgeColor,
      text: "text-blue-600 dark:text-blue-400",
    };
  }

  if (statusUpper.includes("PERDIDA")) {
    return {
      badge: "red" as BadgeColor,
      text: "text-red-600 dark:text-red-400",
    };
  }

  // Default (primary)
  return {
    badge: "default" as BadgeColor,
    text: "text-primary",
  };
};

export const OpportunityInfoCard = ({
  opportunity,
  onView,
  canEditFamily = false,
  onFamilyChange,
}: OpportunityInfoCardProps) => {
  const colors = getStatusColors(opportunity.opportunity_status);

  // Estado local solo para mostrar la familia elegida en esta tarjeta;
  // el dato "real" que usa el formulario contenedor se sincroniza vía onFamilyChange.
  const [displayedFamily, setDisplayedFamily] = useState(opportunity.family);
  const [isEditingFamily, setIsEditingFamily] = useState(false);
  const [familyDraft, setFamilyDraft] = useState("");

  const handleFamilySelect = (value: string, item?: FamiliesResource) => {
    setFamilyDraft(value);
    if (item) {
      setDisplayedFamily(item);
      onFamilyChange?.(item.id, item);
      setIsEditingFamily(false);
    }
  };

  return (
    <Card
      className={
        "gap-0 rounded-2xl bg-card text-card-foreground py-0 overflow-hidden border border-muted shadow-sm"
      }
    >
      {/* Header */}
      <CardHeader className="grid-cols-none flex items-center justify-between gap-3 px-4 py-3! border-b border-border">
        <div className="flex items-center gap-2.5 min-w-0">
          <Target className={cn("size-4 shrink-0", colors.text)} />
          <div className="min-w-0">
            <h3 className="text-sm font-semibold tracking-tight">
              Oportunidad #{opportunity.id}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Información del proceso comercial
            </p>
          </div>
        </div>
        <div className="shrink-0">
          {opportunity.is_closed ? (
            <Badge color="gray" className="text-xs">
              Cerrada
            </Badge>
          ) : (
            <Badge color={colors.badge} className="text-xs">
              {opportunity.opportunity_status}
            </Badge>
          )}
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="px-4 pb-2">
        {/* Cliente */}
        <div className="flex items-start gap-2.5 py-2">
          <User className="size-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Cliente
            </p>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">
                  {opportunity.client.full_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {opportunity.client.num_doc}
                </p>
              </div>
              <Badge
                variant="outline"
                color={getClientStatusVariant(opportunity.client_status)}
                className="text-[10px] h-5 shrink-0"
              >
                {opportunity.client_status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Vehículo */}
        <div className="flex items-start gap-2.5 py-2">
          <Package className="size-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Vehículo de Interés
            </p>

            {isEditingFamily ? (
              <div className="flex items-center gap-1.5 mt-1">
                <div className="flex-1 min-w-0">
                  <SearchableSelectAsync
                    useQueryHook={useFamilies}
                    mapOptionFn={(item: FamiliesResource) => ({
                      value: item.id.toString(),
                      label: `${item.brand} ${item.description}`,
                      description: item.code,
                    })}
                    additionalParams={{
                      "brand$type_operation_id": CM_COMERCIAL_ID,
                      ...(opportunity.lead?.vehicle_brand_id
                        ? { brand_id: opportunity.lead.vehicle_brand_id }
                        : {}),
                    }}
                    defaultOption={{
                      value: displayedFamily.id.toString(),
                      label: `${displayedFamily.brand} ${displayedFamily.description}`,
                      description: displayedFamily.code,
                    }}
                    value={familyDraft}
                    onChange={setFamilyDraft}
                    onValueChange={handleFamilySelect}
                    placeholder="Buscar familia..."
                    buttonSize="sm"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => setIsEditingFamily(false)}
                  variant="outline"
                  size="icon-sm"
                  title="Cancelar"
                >
                  <X/>
                </Button>
              </div>
            ) : (
              <p className="text-sm font-semibold truncate">
                {displayedFamily.brand} {displayedFamily.description}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            {canEditFamily && !isEditingFamily && (
              <Button
                type="button"
                onClick={() => {
                  setFamilyDraft(displayedFamily.id.toString());
                  setIsEditingFamily(true);
                }}
                tooltip="Editar familia"
                size="icon"
                variant="outline"
              >
                <Pencil />
              </Button>
            )}
          </div>
        </div>

        {/* Creada */}
        <div className="flex items-start gap-2.5 py-2">
          <Calendar className="size-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Creada
            </p>
            <p className="text-sm font-semibold">
              {new Date(opportunity.created_at).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Asesor */}
        <div className="flex items-start gap-2.5 py-2">
          <UserCircle2 className="size-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Asesor
            </p>
            <p className="text-sm font-semibold truncate">
              {opportunity.worker.name}
            </p>
          </div>
        </div>

        {/* Origen y acciones */}
        <div className="flex items-start gap-2.5 py-2">
          <Briefcase className="size-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Origen
            </p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">{opportunity.lead?.type}</p>
              {opportunity.actions && opportunity.actions.length > 0 && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <Activity className={cn("size-3.5", colors.text)} />
                  <span className={cn("text-xs font-medium", colors.text)}>
                    {opportunity.actions.length}{" "}
                    {opportunity.actions.length === 1 ? "acción" : "acciones"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comentario */}
        {opportunity.comment && (
          <div className="flex items-start gap-2.5 py-2">
            <MessageSquare className="size-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Comentario
              </p>
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                "{opportunity.comment}"
              </p>
            </div>
          </div>
        )}
      </CardContent>

      {/* Footer */}
      {onView && (
        <CardFooter className="p-0! border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-primary-foreground hover:text-primary-foreground rounded-none py-4!"
            onClick={onView}
          >
            Ver oportunidad
            <ArrowRight className="size-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
