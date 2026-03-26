import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { STORE_VISITS } from "../lib/storeVisits.constants";
import { downloadStoreVisitsFile } from "../lib/storeVisits.actions";
import ExportButtons from "@/shared/components/ExportButtons";

interface StoreVisitsActionsProps {
  dateFrom?: Date;
  dateTo?: Date;
  permissions: {
    canCreate: boolean;
    canExport: boolean;
  };
}

export default function StoreVisitsActions({
  dateFrom,
  dateTo,
  permissions,
}: StoreVisitsActionsProps) {
  const router = useNavigate();
  const { ROUTE_ADD } = STORE_VISITS;

  const formatDate = (date: Date | undefined) => {
    return date ? date.toLocaleDateString("en-CA") : undefined;
  };

  const getDateRange = () =>
    dateFrom && dateTo
      ? [formatDate(dateFrom), formatDate(dateTo)]
      : undefined;

  return (
    <ActionsWrapper>
      <div className="flex items-center gap-2">
        {permissions.canExport && (
          <ExportButtons
            onExcelDownload={() =>
              downloadStoreVisitsFile({ params: { created_at: getDateRange() } })
            }
            onPdfDownload={() =>
              downloadStoreVisitsFile({
                params: { format: "pdf", created_at: getDateRange() },
              })
            }
          />
        )}

        {permissions.canCreate && (
          <Button size="sm" onClick={() => router(ROUTE_ADD!)}>
            <Plus className="size-4 mr-2" /> Agregar Visita
          </Button>
        )}
      </div>
    </ActionsWrapper>
  );
}
