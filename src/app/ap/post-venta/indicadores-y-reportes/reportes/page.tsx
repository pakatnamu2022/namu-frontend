import { SUBTITLE } from "@/core/core.function";
import { ReportsGrid } from "@/shared/components/reports/ReportsGrid";
import {
  POST_VENTA_REPORTS,
  POST_VENTA_REPORTS_CONSTANTS,
} from "@/features/ap/post-venta/reportes/lib/reports.constants";
import PageWrapper from "@/shared/components/PageWrapper";
import TitleComponent from "@/shared/components/TitleComponent";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";

export default function ReportesPostVentaPage() {
  const { hasPermission } = useModulePermissions(
    POST_VENTA_REPORTS_CONSTANTS.ROUTE,
  );
  const visibleReports = POST_VENTA_REPORTS.filter((report) =>
    hasPermission(report.id),
  );

  return (
    <PageWrapper>
      <TitleComponent
        title={POST_VENTA_REPORTS_CONSTANTS.MODEL.name}
        subtitle={SUBTITLE(POST_VENTA_REPORTS_CONSTANTS.MODEL, "fetch")}
        icon={POST_VENTA_REPORTS_CONSTANTS.ICON}
      />

      <ReportsGrid reports={visibleReports} />
    </PageWrapper>
  );
}
