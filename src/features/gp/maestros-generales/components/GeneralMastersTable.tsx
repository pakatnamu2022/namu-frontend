import { DataTable } from "@/shared/components/DataTable";
import { ColumnDef, OnChangeFn, SortingState } from "@tanstack/react-table";
import { GeneralMastersResource } from "../lib/generalMasters.interface";

interface GeneralMastersTableProps {
  columns: ColumnDef<GeneralMastersResource>[];
  data: GeneralMastersResource[];
  isLoading: boolean;
  children?: React.ReactNode;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  manualSorting?: boolean;
}

export default function GeneralMastersTable({
  columns,
  data,
  isLoading,
  children,
  sorting,
  onSortingChange,
  manualSorting,
}: GeneralMastersTableProps) {
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
