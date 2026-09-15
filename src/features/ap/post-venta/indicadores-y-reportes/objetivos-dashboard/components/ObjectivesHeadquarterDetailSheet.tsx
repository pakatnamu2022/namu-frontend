"use client";

import { Loader2, AlertCircle, Wrench, ShoppingBag, Car } from "lucide-react";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { HeadquarterDetail } from "../lib/objectivesDashboard.interface";
import {
  OBJECTIVE_STATUS_BADGE_COLOR,
  OBJECTIVE_STATUS_LABEL,
} from "../lib/objectivesDashboard.constants";
import ObjectivesConceptDetail from "./ObjectivesConceptDetail";

interface ObjectivesHeadquarterDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detail: HeadquarterDetail | null;
  loading?: boolean;
}

const conceptIcon = (areaName: string, isVehicularCrossing: boolean) => {
  if (isVehicularCrossing) return Car;
  if (areaName.toLowerCase().includes("repuesto")) return ShoppingBag;
  return Wrench;
};

export default function ObjectivesHeadquarterDetailSheet({
  open,
  onOpenChange,
  detail,
  loading = false,
}: ObjectivesHeadquarterDetailSheetProps) {
  return (
    <GeneralSheet
      open={open}
      onClose={() => onOpenChange(false)}
      title={detail ? `Sede ${detail.name}` : "Sede"}
      subtitle={detail ? OBJECTIVE_STATUS_LABEL[detail.status] : undefined}
      icon="Building2"
      size="6xl"
      className="overflow-hidden!"
    >
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="size-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">Cargando detalle...</p>
          </div>
        </div>
      )}

      {!loading && !detail && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <AlertCircle className="size-8 mx-auto text-red-500" />
            <p className="text-sm text-red-600">
              No se pudo cargar la información de la sede
            </p>
          </div>
        </div>
      )}

      {!loading && detail && (
        <div className="flex flex-col gap-4">
          {/* Resumen global de la sede */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 p-3 rounded-lg bg-muted/30 border">
            <div className="flex items-center gap-3 pr-4 md:border-r">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Cumplimiento total
                </p>
                <p className="text-2xl font-bold text-primary">
                  {detail.completion_percentage}%
                </p>
              </div>
              <Badge color={OBJECTIVE_STATUS_BADGE_COLOR[detail.status]}>
                {OBJECTIVE_STATUS_LABEL[detail.status]}
              </Badge>
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  S/ {detail.total_progress.toLocaleString("es-PE")} de S/{" "}
                  {detail.total_objective.toLocaleString("es-PE")}
                </span>
              </div>
              <Progress
                value={Math.min(detail.completion_percentage, 100)}
                className="h-2"
              />
            </div>
          </div>

          {detail.concepts.length > 0 && (
            <Tabs defaultValue={String(detail.concepts[0].id)}>
              <TabsList className="w-full justify-start overflow-x-auto">
                {detail.concepts.map((concept) => {
                  const Icon = conceptIcon(
                    concept.area_name,
                    concept.is_vehicular_crossing,
                  );
                  return (
                    <TabsTrigger
                      key={concept.id}
                      value={String(concept.id)}
                      className="gap-1.5"
                    >
                      <Icon className="size-4" />
                      {concept.description}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {detail.concepts.map((concept) => (
                <TabsContent
                  key={concept.id}
                  value={String(concept.id)}
                  className="space-y-4"
                >
                  <ObjectivesConceptDetail concept={concept} />
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      )}
    </GeneralSheet>
  );
}
