import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck } from "lucide-react";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { InternalNoteMigrationResource } from "../lib/internalNoteMigration.interface";
import { useVerifyInternalNoteMigration } from "../lib/internalNoteMigration.hook";

interface Props {
  row: InternalNoteMigrationResource;
  permissions: {
    canVerifyMigration: boolean;
  };
}

export function InternalNoteMigrationActionCell({ row, permissions }: Props) {
  const [open, setOpen] = useState(false);
  const { mutateAsync: verifyMigration, isPending } =
    useVerifyInternalNoteMigration();

  const handleVerify = async () => {
    await verifyMigration(row.id);
    setOpen(false);
  };

  if (!permissions.canVerifyMigration) return null;

  return (
    <div className="flex items-center gap-2">
      <ConfirmationDialog
        trigger={false}
        open={open}
        onOpenChange={setOpen}
        title="¿Verificar Migración de Nota Interna?"
        description="Esta acción verificará la migración de la nota interna seleccionada. ¿Deseas continuar?"
        confirmText="Sí, verificar"
        cancelText="Cancelar"
        icon="info"
        onConfirm={handleVerify}
      />
      <Button
        variant="outline"
        size="icon"
        className="size-7"
        disabled={isPending}
        tooltip={isPending ? "Verificando..." : "Verificar Migración"}
        onClick={() => setOpen(true)}
      >
        {isPending ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <ShieldCheck className="size-5" />
        )}
      </Button>
    </div>
  );
}
