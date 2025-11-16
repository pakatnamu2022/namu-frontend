import { BarChart3, DollarSign, TrendingUp } from "lucide-react";

export default function DashboardWidgets() {
  return (
    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
      <div className="aspect-video rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-2" />
          <p className="text-sm font-semibold">Gráfico de Rendimiento</p>
          <p className="text-xs opacity-80">Datos en tiempo real</p>
        </div>
      </div>
      <div className="aspect-video rounded-xl bg-secondary flex items-center justify-center text-white shadow-lg">
        <div className="text-center">
          <TrendingUp className="w-12 h-12 mx-auto mb-2" />
          <p className="text-sm font-semibold">Métricas en Tiempo Real</p>
          <p className="text-xs opacity-80">Actualización automática</p>
        </div>
      </div>
      <div className="aspect-video rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
        <div className="text-center">
          <DollarSign className="w-12 h-12 mx-auto mb-2" />
          <p className="text-sm font-semibold">Resumen Financiero</p>
          <p className="text-xs opacity-80">Estado actual</p>
        </div>
      </div>
    </div>
  );
}
