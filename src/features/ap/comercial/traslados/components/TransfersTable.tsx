import { DataTable } from "@/shared/components/DataTable";
import type { TransfersColumn } from "./TransfersColumns";
import type { ShipmentsReceptionsResource } from "../../envios-recepciones/lib/shipmentsReceptions.interface";

interface Props {
  columns: TransfersColumn[];
  data: ShipmentsReceptionsResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function TransfersTable({ columns, data, children, isLoading }: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable columns={columns} data={data} isLoading={isLoading}>
        {children}
      </DataTable>
    </div>
  );
}
