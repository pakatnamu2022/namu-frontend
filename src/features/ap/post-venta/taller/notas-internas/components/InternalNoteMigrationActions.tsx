import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Calculator, RefreshCw } from "lucide-react";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { useBulkUpdateInternalNoteAccountingStatus } from "../lib/internalNoteMigration.hook";
import { InternalNoteMigrationResource } from "../lib/internalNoteMigration.interface";

interface Props {
  data: InternalNoteMigrationResource[];
  onRefresh: () => void;
  isRefreshing?: boolean;
  permissions: {
    canUpdateAccountingStatus: boolean;
  };
}

export default function InternalNoteMigrationActions({
  data,
  onRefresh,
  isRefreshing,
}: Props) {
  const [openBulkUpdate, setOpenBulkUpdate] = useState(false);
  const { mutateAsync: bulkUpdateAccountingStatus, isPending: isBulkUpdating } =
    useBulkUpdateInternalNoteAccountingStatus();

  const handleBulkUpdateAccountingStatus = async () => {
    const ids = data.map((item) => item.id);
    await bulkUpdateAccountingStatus(ids);
    setOpenBulkUpdate(false);
  };

  return (
    <ActionsWrapper>
      <ConfirmationDialog
        trigger={false}
        open={openBulkUpdate}
        onOpenChange={setOpenBulkUpdate}
        title="¿Actualizar Estado Contable de las Notas Internas?"
        description="Esta acción actualizará el estado contable de todas las notas internas listadas. ¿Deseas continuar?"
        confirmText="Sí, actualizar"
        cancelText="Cancelar"
        icon="info"
        onConfirm={handleBulkUpdateAccountingStatus}
      />
      <Button
        variant="outline"
        size="sm"
        disabled={isBulkUpdating || data.length === 0}
        onClick={() => setOpenBulkUpdate(true)}
      >
        {isBulkUpdating ? (
          <Loader2 className="size-4 mr-2 animate-spin" />
        ) : (
          <Calculator className="size-4 mr-2" />
        )}
        Verificar Contabilización
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        tooltip="Refrescar"
        disabled={isRefreshing}
        onClick={onRefresh}
      >
        <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} />
      </Button>
    </ActionsWrapper>
  );
}
