import { DataTable } from "@/shared/components/DataTable.tsx";
import { ProductTransferResource } from "@/features/ap/post-venta/gestion-almacen/guia-remision/lib/productTransfer.interface.ts";
import { ProductTransferColumns } from "./ProductTransferColumns.tsx";

interface Props {
  columns?: ProductTransferColumns[];
  data: ProductTransferResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ProductTransferTable({
  columns,
  data,
  children,
  isLoading,
}: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable
        columns={columns || []}
        data={data}
        isLoading={isLoading}
        initialColumnVisibility={{
          nro_reference: true,
          nro_reference_dyn: true,
          fechas_guia: true,
          warehouse_code: true,
          warehouse_destination_code: true,
          transporte_info: false,
          motivo_traslado: true,
          status_sunat: true,
          status_recepcion: true,
          notas_guia: false,
          total_items: false,
          total_quantity: false,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
