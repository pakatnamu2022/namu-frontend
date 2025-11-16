"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  IndicatorBySede,
  IndicatorBySedeAndBrand,
} from "../lib/dashboard.interface";

interface SedeDetailsPanelProps {
  sede: IndicatorBySede;
  brandData: IndicatorBySedeAndBrand[];
  onClose?: () => void;
  showCloseButton?: boolean;
}

export default function SedeDetailsPanel({
  sede,
  brandData,
  onClose,
  showCloseButton = true,
}: SedeDetailsPanelProps) {
  return (
    <Card className="sticky top-4 border-2 border-primary/20">
      <CardContent className="pt-6">
        {showCloseButton && onClose && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Detalle de {sede.sede_nombre}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Sede Stats */}
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
            <div className="text-sm text-muted-foreground mb-1">Total</div>
            <div className="text-3xl font-bold text-primary">
              {sede.total_visitas}
            </div>
          </div>

          {/* Progress Bars */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-green-600 font-medium">Atendidos</span>
                <span className="text-green-600 font-semibold">
                  {sede.atendidos} (
                  {sede.total_visitas > 0
                    ? ((sede.atendidos / sede.total_visitas) * 100).toFixed(1)
                    : 0}
                  %)
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600 transition-all duration-500"
                  style={{
                    width: `${
                      sede.total_visitas > 0
                        ? (sede.atendidos / sede.total_visitas) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-yellow-600 font-medium">
                  No Atendidos
                </span>
                <span className="text-yellow-600 font-semibold">
                  {sede.no_atendidos} (
                  {sede.total_visitas > 0
                    ? ((sede.no_atendidos / sede.total_visitas) * 100).toFixed(
                        1
                      )
                    : 0}
                  %)
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-600 transition-all duration-500"
                  style={{
                    width: `${
                      sede.total_visitas > 0
                        ? (sede.no_atendidos / sede.total_visitas) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-red-600 font-medium">Descartados</span>
                <span className="text-red-600 font-semibold">
                  {sede.descartados} (
                  {sede.total_visitas > 0
                    ? ((sede.descartados / sede.total_visitas) * 100).toFixed(1)
                    : 0}
                  %)
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-600 transition-all duration-500"
                  style={{
                    width: `${
                      sede.total_visitas > 0
                        ? (sede.descartados / sede.total_visitas) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Brands for Selected Sede */}
          {brandData.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
                Por Marca
              </h4>
              <div className="space-y-2">
                {brandData.map((brand) => (
                  <div
                    key={`${brand.sede_id}-${brand.vehicle_brand_id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <span className="font-medium text-sm">
                      {brand.marca_nombre}
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {brand.total_visitas}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
