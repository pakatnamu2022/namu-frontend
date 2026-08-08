import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Calculator } from "lucide-react";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { InternalNoteMigrationResource } from "../lib/internalNoteMigration.interface";
import { useUpdateInternalNoteAccountingStatus } from "../lib/internalNoteMigration.hook";
import InternalNoteHistory from "../../orden-trabajo/components/InternalNoteHistory";

interface Props {
  row: InternalNoteMigrationResource;
  permissions: {
    canVerifyMigration: boolean;
  };
}

export function InternalNoteMigrationActionCell({ row }: Props) {
  const [openAccountingStatus, setOpenAccountingStatus] = useState(false);
  const {
    mutateAsync: updateAccountingStatus,
    isPending: isUpdatingAccountingStatus,
  } = useUpdateInternalNoteAccountingStatus();

  const isSkipped = row.migration_status === "skipped";

  const handleUpdateAccountingStatus = async () => {
    await updateAccountingStatus(row.id);
    setOpenAccountingStatus(false);
  };

  if (isSkipped) {
    return (
      <InternalNoteHistory
        workOrderId={row.work_order_id}
        internalNoteId={row.id}
      />
    );
  }

  return (
    <div className="flex items-center gap-2">
      <ConfirmationDialog
        trigger={false}
        open={openAccountingStatus}
        onOpenChange={setOpenAccountingStatus}
        title="¿Actualizar Estado Contable de la Nota Interna?"
        description="Esta acción actualizará el estado contable de la nota interna seleccionada. ¿Deseas continuar?"
        confirmText="Sí, actualizar"
        cancelText="Cancelar"
        icon="info"
        onConfirm={handleUpdateAccountingStatus}
      />
      <Button
        variant="outline"
        size="icon"
        className="size-7"
        disabled={isUpdatingAccountingStatus}
        tooltip={
          isUpdatingAccountingStatus
            ? "Actualizando..."
            : "Verificar Contabilizado"
        }
        onClick={() => setOpenAccountingStatus(true)}
      >
        {isUpdatingAccountingStatus ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <Calculator className="size-5" />
        )}
      </Button>
      <InternalNoteHistory
        workOrderId={row.work_order_id}
        internalNoteId={row.id}
      />
    </div>
  );
}
