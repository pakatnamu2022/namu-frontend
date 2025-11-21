import { DataTable } from "@/shared/components/DataTable";
import { ReceptionResource } from "../lib/receptionsProducts.interface";
import { ReceptionsProductsColumns } from "./ReceptionsProductsColumns";

interface Props {
  columns?: ReceptionsProductsColumns[];
  data: ReceptionResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
  customContent?: React.ReactNode;
}

export default function ReceptionsProductsTable({
  columns,
  data,
  children,
  isLoading,
  customContent,
}: Props) {
  // Si hay contenido personalizado (cards), mostrar eso en lugar de la tabla
  if (customContent) {
    return (
      <div className="space-y-4">
        {children}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Cargando...
          </div>
        ) : (
          customContent
        )}
      </div>
    );
  }

  // Comportamiento por defecto: tabla
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable
        columns={columns || []}
        data={data}
        isLoading={isLoading}
        initialColumnVisibility={{
          purchase_order_number: true,
          reception_date: true,
          warehouse_name: true,
          shipping_guide_number: true,
          received_by_name: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
