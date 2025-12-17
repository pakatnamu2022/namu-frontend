import { AvancePorSede as AvancePorSedeType } from "../lib/daily-delivery.interface";
import { cn } from "@/lib/utils";
import { Package, ShoppingCart, FileText } from "lucide-react";

interface AvancePorSedeProps {
  avancePorSede: AvancePorSedeType[];
}

const getProgressColor = (cumplimiento: number) => {
  if (cumplimiento >= 100) return "bg-green-500";
  if (cumplimiento >= 75) return "bg-blue-500";
  if (cumplimiento >= 50) return "bg-yellow-500";
  return "bg-red-500";
};

const getTextColor = (cumplimiento: number) => {
  if (cumplimiento >= 100) return "text-green-600";
  if (cumplimiento >= 75) return "text-blue-600";
  if (cumplimiento >= 50) return "text-yellow-600";
  return "text-red-600";
};

export default function AvancePorSede({ avancePorSede }: AvancePorSedeProps) {
  if (!avancePorSede || avancePorSede.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
        No hay datos de avance por sede disponibles
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {avancePorSede.map((sede) => (
        <div
          key={sede.sede_id}
          className="rounded-lg border bg-card overflow-hidden"
        >
          <div className="bg-muted/30 px-4 py-2.5 border-b">
            <h3 className="font-semibold text-sm">{sede.sede_name}</h3>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Header */}
              <div className="grid grid-cols-[200px_1fr_1fr_1fr] gap-3 px-4 py-3 bg-muted/20 border-b text-xs font-medium">
                <div>Marca</div>
                <div className="flex items-center gap-2">
                  <Package className="h-3.5 w-3.5 text-blue-600" />
                  <span>Entregas</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-3.5 w-3.5 text-green-600" />
                  <span>Compras</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-purple-600" />
                  <span>Reporte</span>
                </div>
              </div>

              {/* Rows */}
              {sede.brands.map((brand, idx) => (
                <div
                  key={brand.brand_id}
                  className={cn(
                    "grid grid-cols-[200px_1fr_1fr_1fr] gap-3 px-4 py-3 hover:bg-muted/30 transition-colors",
                    idx !== sede.brands.length - 1 && "border-b"
                  )}
                >
                  <div className="font-medium text-sm flex items-center">
                    {brand.brand_name}
                  </div>

                  {/* Entregas */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {brand.resultado_entrega} / {brand.objetivo_ap_entregas}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          getTextColor(brand.cumplimiento_entrega)
                        )}
                      >
                        {brand.cumplimiento_entrega.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all",
                          getProgressColor(brand.cumplimiento_entrega)
                        )}
                        style={{
                          width: `${Math.min(
                            brand.cumplimiento_entrega,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Compras */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {brand.avance_compra} /{" "}
                        {brand.objetivos_compra_inchcape}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          getTextColor(brand.cumplimiento_compra)
                        )}
                      >
                        {brand.cumplimiento_compra.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all",
                          getProgressColor(brand.cumplimiento_compra)
                        )}
                        style={{
                          width: `${Math.min(brand.cumplimiento_compra, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Reporte */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {brand.reporte_dealer_portal ?? "-"} /{" "}
                        {brand.objetivos_reporte_inchcape}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          brand.cumplimiento_reporte !== null
                            ? getTextColor(brand.cumplimiento_reporte)
                            : "text-muted-foreground"
                        )}
                      >
                        {brand.cumplimiento_reporte !== null
                          ? `${brand.cumplimiento_reporte.toFixed(0)}%`
                          : "-"}
                      </span>
                    </div>
                    <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all",
                          brand.cumplimiento_reporte !== null
                            ? getProgressColor(brand.cumplimiento_reporte)
                            : "bg-gray-300"
                        )}
                        style={{
                          width: `${
                            brand.cumplimiento_reporte !== null
                              ? Math.min(brand.cumplimiento_reporte, 100)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
