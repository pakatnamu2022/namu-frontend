import { DataTable } from "@/shared/components/DataTable";
import { ColumnDef, OnChangeFn, SortingState } from "@tanstack/react-table";
import { ApMastersResource } from "../lib/apMasters.interface";

interface ApMastersTableProps {
  columns: ColumnDef<ApMastersResource>[];
  data: ApMastersResource[];
  isLoading: boolean;
  children?: React.ReactNode;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  manualSorting?: boolean;
}

export default function ApMastersTable({
  columns,
  data,
  isLoading,
  children,
  sorting,
  onSortingChange,
  manualSorting,
}: ApMastersTableProps) {
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
