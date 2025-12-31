import { DataTable } from "@/shared/components/DataTable";
import { ColumnDef, OnChangeFn, SortingState } from "@tanstack/react-table";
import { CommercialMastersResource } from "../lib/commercialMasters.interface";

interface CommercialMastersTableProps {
  columns: ColumnDef<CommercialMastersResource>[];
  data: CommercialMastersResource[];
  isLoading: boolean;
  children?: React.ReactNode;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  manualSorting?: boolean;
}

export default function CommercialMastersTable({
  columns,
  data,
  isLoading,
  children,
  sorting,
  onSortingChange,
  manualSorting,
}: CommercialMastersTableProps) {
  return (
    <DataTable
      sorting={sorting}
      onSortingChange={onSortingChange}
      manualSorting={manualSorting}
      columns={columns}
      data={data}
      isLoading={isLoading}
    >
      {children}
    </DataTable>
  );
}
