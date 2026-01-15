import { SUBTITLE } from "@/core/core.function";
import { ReportCard } from "@/features/ap/comercial/reportes/components/ReportCard";
import {
  COMMERCIAL_REPORTS,
  REPORTS_CONSTANTS,
} from "@/features/ap/comercial/reportes/lib/reports.constants";
import PageWrapper from "@/shared/components/PageWrapper";
import TitleComponent from "@/shared/components/TitleComponent";
import { FileBarChart } from "lucide-react";

export default function ReportesComercialPage() {
  return (
    <PageWrapper>
      {/* Header */}
      <TitleComponent
        title={REPORTS_CONSTANTS.MODEL.name}
        subtitle={SUBTITLE(REPORTS_CONSTANTS.MODEL, "fetch")}
        icon={REPORTS_CONSTANTS.ICON}
      />

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
    </PageWrapper>
  );
}
