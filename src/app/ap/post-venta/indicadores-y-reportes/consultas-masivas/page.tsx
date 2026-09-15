import { SUBTITLE } from "@/core/core.function";
import { BulkQueriesGrid } from "@/shared/components/bulk-queries/BulkQueriesGrid";
import {
  POST_VENTA_BULK_QUERIES,
  POST_VENTA_BULK_QUERIES_CONSTANTS,
} from "@/features/ap/post-venta/consultas-masivas/lib/bulkQueries.constants";
import PageWrapper from "@/shared/components/PageWrapper";
import TitleComponent from "@/shared/components/TitleComponent";

export default function ConsultasMasivasPostVentaPage() {
  return (
    <PageWrapper>
      <TitleComponent
        title={POST_VENTA_BULK_QUERIES_CONSTANTS.MODEL.name}
        subtitle={SUBTITLE(POST_VENTA_BULK_QUERIES_CONSTANTS.MODEL, "fetch")}
        icon={POST_VENTA_BULK_QUERIES_CONSTANTS.ICON}
      />

      <BulkQueriesGrid queries={POST_VENTA_BULK_QUERIES} />
    </PageWrapper>
  );
}
