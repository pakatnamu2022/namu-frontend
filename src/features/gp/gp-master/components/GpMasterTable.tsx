import { DataTable } from "@/shared/components/DataTable";
import { ColumnDef, OnChangeFn, SortingState } from "@tanstack/react-table";
import { GpMastersResource } from "../lib/gpMaster.interface";

interface GpMasterTableProps {
  columns: ColumnDef<GpMastersResource>[];
  data: GpMastersResource[];
  isLoading: boolean;
  children?: React.ReactNode;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  manualSorting?: boolean;
}

export default function GpMasterTable({
  columns,
  data,
  isLoading,
  children,
  sorting,
  onSortingChange,
  manualSorting,
}: GpMasterTableProps) {
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
