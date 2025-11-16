import { DataTable } from "@/src/shared/components/DataTable";
import { ElectronicDocumentColumn } from "./ElectronicDocumentColumns";
import { ElectronicDocumentResource } from "../lib/electronicDocument.interface";

interface Props {
  columns: ElectronicDocumentColumn[];
  data: ElectronicDocumentResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ElectronicDocumentTable({
  columns,
  data,
  children,
  isLoading,
}: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        initialColumnVisibility={{
          status: true,
          documentType: false,
          serie: true,
          cliente_denominacion: true,
          fecha_de_emision: true,
          currency: true,
          total: true,
          aceptada_por_sunat: true,
          anulado: false,
          origin_module: false,
          actions: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
