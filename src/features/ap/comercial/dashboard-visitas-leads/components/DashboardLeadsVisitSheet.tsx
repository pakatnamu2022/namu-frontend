"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Building2, Loader2, AlertCircle } from "lucide-react";
import {
  IndicatorBySede,
  IndicatorBySedeAndBrand,
  IndicatorByAdvisor,
} from "../lib/dashboard.interface";
import SedeDetailsPanel from "./SedeDetailsPanel";
import DashboardAdvisorTable from "./DashboardAdvisorTable";

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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[1200px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Building2 className="size-5 text-primary" />
            {sede ? `Sede ${sede.sede_nombre}` : "Sede"}
          </SheetTitle>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Loading State */}
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

          {/* No Sede Selected */}
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

          {/* Success State - Show Sede Details and Advisor Table */}
          {!loading && sede && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Sede Details Panel */}
              <div className="lg:col-span-1">
                <SedeDetailsPanel
                  sede={sede}
                  brandData={brandData}
                  showCloseButton={false}
                />
              </div>

              {/* Right Column - Advisor Table */}
              <div className="lg:col-span-2">
                <DashboardAdvisorTable
                  data={advisorData}
                  selectedSedeId={sede.sede_id}
                />
              </div>
            </div>
          )}
        </div>

        <SheetFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cerrar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
