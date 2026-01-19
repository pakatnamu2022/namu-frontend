"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, AlertCircle } from "lucide-react";
import {
  IndicatorBySede,
  IndicatorBySedeAndBrand,
  IndicatorByAdvisor,
} from "../lib/dashboard.interface";
import DashboardAdvisorTable from "./DashboardAdvisorTable";
import GeneralSheet from "@/shared/components/GeneralSheet";

interface StatProgressProps {
  label: string;
  value: number;
  total: number;
  color: "green" | "yellow" | "red";
}

const colorClasses = {
  green: { text: "text-green-600", indicator: "bg-green-600" },
  yellow: { text: "text-yellow-600", indicator: "bg-yellow-600" },
  red: { text: "text-red-600", indicator: "bg-red-600" },
};

function StatProgress({ label, value, total, color }: StatProgressProps) {
  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
  const progressValue = total > 0 ? (value / total) * 100 : 0;
  const classes = colorClasses[color];

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className={`${classes.text} font-medium`}>{label}</span>
        <span className={`${classes.text} font-semibold`}>
          {value} ({percentage}%)
        </span>
      </div>
      <Progress
        value={progressValue}
        className="h-2"
        indicatorClassName={classes.indicator}
      />
    </div>
  );
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sede: IndicatorBySede | null;
  brandData: IndicatorBySedeAndBrand[];
  advisorData: IndicatorByAdvisor[];
  loading?: boolean;
}

export default function DashboardLeadsVisitSheet({
  open,
  onOpenChange,
  sede,
  brandData,
  advisorData,
  loading = false,
}: Props) {
  return (
    <GeneralSheet
      open={open}
      onClose={() => onOpenChange(false)}
      title={sede ? `Sede ${sede.sede_nombre}` : "Sede"}
      icon="Building2"
      size="7xl"
      className="overflow-hidden!"
    >
      <div className="h-full">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="size-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">
                Cargando detalles...
              </p>
            </div>
          </div>
        )}

        {!loading && !sede && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <AlertCircle className="size-8 mx-auto text-red-500" />
              <p className="text-sm text-red-600">
                No se pudo cargar la información de la sede
              </p>
            </div>
          </div>
        )}

        {!loading && sede && (
          <>
            <div className="flex flex-wrap items-center gap-6">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                <div className="text-sm text-muted-foreground mb-1">Total</div>
                <div className="text-3xl font-bold text-primary">
                  {sede.total_visitas}
                </div>
              </div>

              <div className="flex-1 md:min-w-[300px] space-y-3">
                <StatProgress
                  label="Atendidos"
                  value={sede.atendidos}
                  total={sede.total_visitas}
                  color="green"
                />
                <StatProgress
                  label="No Atendidos"
                  value={sede.no_atendidos}
                  total={sede.total_visitas}
                  color="yellow"
                />
                <StatProgress
                  label="Descartados"
                  value={sede.descartados}
                  total={sede.total_visitas}
                  color="red"
                />
              </div>
            </div>

            {brandData.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {brandData.map((brand) => (
                  <Card
                    key={`${brand.sede_id}-${brand.vehicle_brand_id}`}
                    className="bg-muted/50 py-3"
                  >
                    <CardContent className="px-3 flex justify-between items-center">
                      <div className="text-muted-foreground text-sm">
                        {brand.marca_nombre}
                      </div>
                      <div className="text-lg font-bold text-primary">
                        {brand.total_visitas}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <DashboardAdvisorTable
              data={advisorData}
              selectedSedeId={sede.sede_id}
            />
          </>
        )}
      </div>
    </GeneralSheet>
  );
}
