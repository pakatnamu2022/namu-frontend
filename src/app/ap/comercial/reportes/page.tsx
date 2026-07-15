import { SUBTITLE } from "@/core/core.function";
import { ReportsGrid } from "@/shared/components/reports/ReportsGrid";
import {
  COMMERCIAL_REPORTS,
  REPORTS_CONSTANTS,
} from "@/features/ap/comercial/reportes/lib/reports.constants";
import PageWrapper from "@/shared/components/PageWrapper";
import TitleComponent from "@/shared/components/TitleComponent";

export default function ReportesComercialPage() {
  return (
    <PageWrapper>
      <TitleComponent
        title={REPORTS_CONSTANTS.MODEL.name}
        subtitle={SUBTITLE(REPORTS_CONSTANTS.MODEL, "fetch")}
        icon={REPORTS_CONSTANTS.ICON}
      />

      <ReportsGrid reports={COMMERCIAL_REPORTS} />
    </PageWrapper>
  );
}
