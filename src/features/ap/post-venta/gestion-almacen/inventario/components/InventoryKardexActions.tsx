"use client";

import { useMutation } from "@tanstack/react-query";
import ExportButtons from "@/shared/components/ExportButtons.tsx";
import { exportInventoryKardex } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.actions.ts";

interface Props {
  /** Mismos filtros que consume useInventoryKardex, tal cual. */
  filters: Record<string, any>;
  disabled?: boolean;
}

export default function InventoryKardexActions({ filters, disabled }: Props) {
  const { mutateAsync: doExport } = useMutation({
    mutationFn: exportInventoryKardex,
  });

  return (
    <ExportButtons
      onExcelDownload={() => doExport(filters)}
      disableExcel={disabled}
    />
  );
}
