"use client";

import { Loader2, AlertCircle } from "lucide-react";
import {
  IndicatorBySede,
  IndicatorBySedeAndBrand,
  IndicatorByAdvisor,
} from "../lib/dashboard.interface";
import DashboardAdvisorTable from "./DashboardAdvisorTable";
import GeneralSheet from "@/shared/components/GeneralSheet";

interface StatItemProps {
  label: string;
  value: number;
  total: number;
  color: string;
  bgColor: string;
}

function StatItem({ label, value, total, color, bgColor }: StatItemProps) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  const barHeight = Math.max(percentage * 0.32, 4);
  return (
    <div className="flex items-end gap-2 h-10">
      <div
        className={`w-2 rounded-full ${bgColor}`}
        style={{ height: `${barHeight}px` }}
      />
      <div className="flex flex-col justify-end">
        <span className="text-xs text-muted-foreground">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className={`text-lg font-bold ${color}`}>{value}</span>
          <span className="text-xs text-muted-foreground">({percentage}%)</span>
        </div>
      </div>
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
          <div className="flex flex-col gap-4">
            {/* Barra de estadísticas compacta */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 p-3 rounded-lg bg-muted/30 border">
              {/* Total y Estados */}
              <div className="flex items-center gap-4 md:gap-6">
                {/* Total */}
                <div className="flex items-center gap-2 md:gap-3 pr-4 md:pr-6 border-r">
                  <div className="text-2xl md:text-3xl font-bold text-primary">
                    {sede.total_visitas}
                  </div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    Visitas
                  </span>
                </div>

                {/* Estados */}
                <div className="flex items-center gap-4 md:gap-6">
                  <StatItem
                    label="Atendidos"
                    value={sede.atendidos}
                    total={sede.total_visitas}
                    color="text-green-600"
                    bgColor="bg-green-500"
                  />
                  <StatItem
                    label="No Atendidos"
                    value={sede.no_atendidos}
                    total={sede.total_visitas}
                    color="text-yellow-600"
                    bgColor="bg-yellow-500"
                  />
                  <StatItem
                    label="Descartados"
                    value={sede.descartados}
                    total={sede.total_visitas}
                    color="text-red-600"
                    bgColor="bg-red-500"
                  />
                </div>
              </div>

              {/* Separador y Marcas */}
              {brandData.length > 0 && (
                <>
                  <div className="hidden md:block h-10 w-px bg-border" />
                  <div className="h-px md:hidden w-full bg-border" />
                  <div className="flex items-center gap-4 flex-wrap">
                    {brandData.map((brand) => (
                      <div
                        key={`${brand.sede_id}-${brand.vehicle_brand_id}`}
                        className="flex flex-col items-center"
                      >
                        <span className="text-sm font-bold text-primary">
                          {brand.total_visitas}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {brand.marca_nombre}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <DashboardAdvisorTable
              data={advisorData}
              selectedSedeId={sede.sede_id}
            />
          </div>
        )}
      </div>
    </GeneralSheet>
  );
}
