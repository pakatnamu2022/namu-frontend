import { DataTable } from "@/shared/components/DataTable";
import { TransferReceptionResource } from "../lib/transferReception.interface";
import { TransferReceptionsColumns } from "./TransferReceptionsColumns";

interface Props {
  columns?: TransferReceptionsColumns[];
  data: TransferReceptionResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
  customContent?: React.ReactNode;
}

export default function TransferReceptionsTable({
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
          reception_number: true,
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
