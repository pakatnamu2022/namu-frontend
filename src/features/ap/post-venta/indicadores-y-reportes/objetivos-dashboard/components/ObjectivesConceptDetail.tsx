"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Concept,
  ObjectiveStatus,
  VehicleCrossingByBrand,
} from "../lib/objectivesDashboard.interface";
import {
  OBJECTIVE_STATUS_BADGE_COLOR,
  OBJECTIVE_STATUS_LABEL,
} from "../lib/objectivesDashboard.constants";
import ObjectivesAreaOverview from "./ObjectivesAreaOverview";
import { ChartBarVertical } from "@/shared/charts/ChartBarVertical";
import DonutChart, {
  DonutChartDataItem,
} from "@/features/ap/comercial/dashboard-visitas-leads/components/DonutChart";

const formatCompactSoles = (value: number) =>
  `S/${new Intl.NumberFormat("es-PE", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)}`;

const CHART_COLORS = [
  "var(--color-blue-500)",
  "var(--color-emerald-500)",
  "var(--color-amber-500)",
  "var(--color-violet-500)",
  "var(--color-rose-500)",
  "var(--color-cyan-500)",
];

interface ObjectivesConceptDetailProps {
  concept: Concept;
}

// El backend a veces filtra una entidad de marca "cruda" (con id/code/logo, etc.)
// dentro de by_brand_m1/by_brand_m2. Se descarta cualquier entrada sin la forma esperada.
const sanitizeVehicleCrossingBrands = (
  items: VehicleCrossingByBrand[] | undefined,
): VehicleCrossingByBrand[] =>
  (items ?? []).filter(
    (item): item is VehicleCrossingByBrand =>
      typeof item?.brand_name === "string" && typeof item?.count === "number",
  );

interface VehicleCrossingMode {
  key: string;
  label: string;
  progress: number;
  completionPercentage: number;
  status: ObjectiveStatus;
  byBrand: VehicleCrossingByBrand[];
}

function VehicleCrossingModeContent({
  objective,
  mode,
}: {
  objective: number;
  mode: VehicleCrossingMode;
}) {
  return (
    <div className="space-y-4">
      <ObjectivesAreaOverview
        area={{
          objective,
          progress: mode.progress,
          completion_percentage: mode.completionPercentage,
          status: mode.status,
        }}
        unit="count"
      />

      {mode.byBrand.length > 0 && (
        <DonutChart
          title="Paso vehícular por Marca"
          description="Distribución de vehículos ingresados por marca"
          data={mode.byBrand.map((brand, index) => {
            const item: DonutChartDataItem = {
              name: brand.brand_name,
              value: brand.count,
              color: CHART_COLORS[index % CHART_COLORS.length],
            };
            return item;
          })}
        />
      )}
    </div>
  );
}

export default function ObjectivesConceptDetail({
  concept,
}: ObjectivesConceptDetailProps) {
  const byBrand = concept.by_brand ?? [];
  const topAdvisors = concept.top_advisors ?? [];

  const hasVehicleCrossingModes =
    concept.is_vehicular_crossing &&
    (concept.progress_m1 !== undefined || concept.progress_m2 !== undefined);

  const vehicleCrossingModes: VehicleCrossingMode[] = hasVehicleCrossingModes
    ? [
        {
          key: "derco",
          label: "Derco",
          progress: concept.progress_m1 ?? concept.progress,
          completionPercentage:
            concept.completion_percentage_m1 ?? concept.completion_percentage,
          status: concept.status_m1 ?? concept.status,
          byBrand: sanitizeVehicleCrossingBrands(concept.by_brand_m1),
        },
        {
          key: "automotores",
          label: "Automotores",
          progress: concept.progress_m2 ?? concept.progress,
          completionPercentage:
            concept.completion_percentage_m2 ?? concept.completion_percentage,
          status: concept.status_m2 ?? concept.status,
          byBrand: sanitizeVehicleCrossingBrands(concept.by_brand_m2),
        },
      ]
    : [];

  return (
    <div className="space-y-4">
      {hasVehicleCrossingModes ? (
        <Tabs defaultValue={vehicleCrossingModes[0].key}>
          <TabsList>
            {vehicleCrossingModes.map((mode) => (
              <TabsTrigger key={mode.key} value={mode.key}>
                {mode.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {vehicleCrossingModes.map((mode) => (
            <TabsContent key={mode.key} value={mode.key} className="mt-4">
              <VehicleCrossingModeContent
                objective={concept.objective}
                mode={mode}
              />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <ObjectivesAreaOverview
          area={concept}
          unit={concept.is_vehicular_crossing ? "count" : "currency"}
        />
      )}

      {concept.is_vehicular_crossing &&
        !hasVehicleCrossingModes &&
        byBrand.length > 0 && (
          <DonutChart
            title="Paso vehícular por Marca"
            description="Distribución de vehículos ingresados por marca"
            data={byBrand.map((brand, index) => {
              const item: DonutChartDataItem = {
                name: brand.brand_name,
                value: "count" in brand ? brand.count : brand.total_billing,
                color: CHART_COLORS[index % CHART_COLORS.length],
              };
              return item;
            })}
          />
        )}

      {!concept.is_vehicular_crossing && byBrand.length > 0 && (
        <ChartBarVertical
          title="Por Marca"
          subtitle="Facturación por marca de vehículo"
          valueLabel="Facturación"
          valueFormatter={formatCompactSoles}
          data={[...byBrand]
            .map((brand) => ({
              name: brand.brand_name,
              value: "total_billing" in brand ? brand.total_billing : brand.count,
              extra:
                "vehicle_count" in brand ? `${brand.vehicle_count} veh.` : "",
            }))
            .sort((a, b) => b.value - a.value)}
        />
      )}

      {topAdvisors.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Asesores</CardTitle>
            <CardDescription>
              Ranking de cumplimiento individual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {topAdvisors.map((advisor) => {
              const hasObjective = advisor.objective > 0;

              return (
                <div
                  key={advisor.advisor_id}
                  className={cn(
                    "rounded-lg border p-3 space-y-2",
                    hasObjective &&
                      advisor.rank === 1 &&
                      "border-amber-300 bg-amber-50 dark:bg-amber-950/30",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {hasObjective && advisor.rank === 1 ? (
                        <Trophy className="size-4 text-amber-500 shrink-0" />
                      ) : (
                        <span className="text-xs text-muted-foreground w-4 text-center shrink-0">
                          {advisor.rank}
                        </span>
                      )}
                      <span className="font-medium truncate">
                        {advisor.advisor_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="hidden sm:flex flex-col items-end leading-tight">
                        <span className="text-sm font-medium">
                          S/ {advisor.progress.toLocaleString("es-PE")}
                        </span>
                        {hasObjective && (
                          <span className="text-xs text-muted-foreground">
                            de S/ {advisor.objective.toLocaleString("es-PE")}
                          </span>
                        )}
                      </div>
                      <Badge
                        color={OBJECTIVE_STATUS_BADGE_COLOR[advisor.status]}
                      >
                        {hasObjective
                          ? `${advisor.completion_percentage}%`
                          : OBJECTIVE_STATUS_LABEL[advisor.status]}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
