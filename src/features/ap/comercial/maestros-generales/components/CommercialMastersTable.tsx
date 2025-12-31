import { DataTable } from "@/shared/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { CommercialMastersResource } from "../lib/commercialMasters.interface";

interface CommercialMastersTableProps {
  columns: ColumnDef<CommercialMastersResource>[];
  data: CommercialMastersResource[];
  isLoading: boolean;
  children?: React.ReactNode;
}

export default function CommercialMastersTable({
  columns,
  data,
  isLoading,
  children,
}: CommercialMastersTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      filterPlaceholder="Buscar por código o descripción..."
    >
      {children}
    </DataTable>
  );
}
