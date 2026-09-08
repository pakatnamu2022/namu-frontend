import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog.tsx";
import { Download, LayoutGrid, Loader2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { errorToast, successToast } from "@/core/core.function.ts";
import { ProductShelfResource } from "@/features/ap/post-venta/gestion-almacen/estantes-almacen/lib/productShelf.interface.ts";
import { exportProductShelf } from "@/features/ap/post-venta/gestion-almacen/estantes-almacen/lib/productShelf.actions.ts";

interface Props {
  row: ProductShelfResource;
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
  onManage: (id: number) => void;
  onToggleStatus: (id: number, newStatus: boolean) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export function ProductShelfActionCell({
  row,
  onDelete,
  onUpdate,
  onManage,
  onToggleStatus,
  permissions,
}: Props) {
  const { id, code, status } = row;
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportProductShelf(id, code);
      successToast("Estante exportado exitosamente");
    } catch (error: any) {
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Error al exportar el estante";
      errorToast(message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Toggle Status */}
      {permissions.canUpdate && (
        <Switch
          checked={status}
          onCheckedChange={(checked) => onToggleStatus(id, checked)}
          className={cn(status ? "bg-primary" : "bg-secondary")}
        />
      )}

      {/* Exportar a Excel */}
      <Button
        variant="outline"
        size="icon"
        className="size-7"
        onClick={handleExport}
        disabled={isExporting}
        tooltip={isExporting ? "Exportando..." : "Exportar a Excel"}
      >
        {isExporting ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <Download className="size-5" />
        )}
      </Button>

      {/* Organizar repuestos */}
      <Button
        variant="outline"
        size="icon"
        className="size-7"
        tooltip="Organizar repuestos"
        onClick={() => onManage(id)}
      >
        <LayoutGrid className="size-5" />
      </Button>

      {/* Edit */}
      {permissions.canUpdate && (
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          tooltip="Editar"
          onClick={() => onUpdate(id)}
        >
          <Pencil className="size-5" />
        </Button>
      )}

      {/* Delete */}
      {permissions.canDelete && (
        <DeleteButton onClick={() => onDelete(id)} />
      )}
    </div>
  );
}
