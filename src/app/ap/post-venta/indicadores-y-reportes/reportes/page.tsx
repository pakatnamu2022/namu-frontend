import { SUBTITLE } from "@/core/core.function";
import { ReportsGrid } from "@/shared/components/reports/ReportsGrid";
import {
  POST_VENTA_REPORTS,
  POST_VENTA_REPORTS_CONSTANTS,
} from "@/features/ap/post-venta/reportes/lib/reports.constants";
import PageWrapper from "@/shared/components/PageWrapper";
import TitleComponent from "@/shared/components/TitleComponent";

export default function ReportesPostVentaPage() {
  return (
    <PageWrapper>
      <TitleComponent
        title={POST_VENTA_REPORTS_CONSTANTS.MODEL.name}
        subtitle={SUBTITLE(POST_VENTA_REPORTS_CONSTANTS.MODEL, "fetch")}
        icon={POST_VENTA_REPORTS_CONSTANTS.ICON}
      />

      <ReportsGrid reports={POST_VENTA_REPORTS} />
    </PageWrapper>
  );
}
