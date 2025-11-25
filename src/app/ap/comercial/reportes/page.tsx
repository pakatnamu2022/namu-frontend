import { ReportCard } from "@/features/ap/comercial/reportes/components/ReportCard";
import {
  COMMERCIAL_REPORTS,
  REPORTS_CONSTANTS,
} from "@/features/ap/comercial/reportes/lib/reports.constants";
import { FileBarChart } from "lucide-react";

export default function ReportesComercialPage() {
  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {REPORTS_CONSTANTS.TITLE}
        </h1>
        <p className="text-sm text-muted-foreground">
          {REPORTS_CONSTANTS.DESCRIPTION}
        </p>
      </div>

      {/* Lista de reportes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {COMMERCIAL_REPORTS.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </div>

      {/* Mensaje si no hay reportes */}
      {COMMERCIAL_REPORTS.length === 0 && (
        <div className="text-center py-12">
          <FileBarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            No hay reportes disponibles
          </h3>
          <p className="text-muted-foreground">
            Los reportes se agregarán próximamente
          </p>
        </div>
      )}
    </div>
  );
}
