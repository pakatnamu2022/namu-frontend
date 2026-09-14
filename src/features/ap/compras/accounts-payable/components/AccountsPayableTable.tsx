import type {
  ColumnDef,
  SortingState,
  Updater,
  RowSelectionState,
  OnChangeFn,
} from "@tanstack/react-table";
import { DataTable } from "@/shared/components/DataTable";
import DataTablePagination from "@/shared/components/DataTablePagination";
import type { AccountPayable } from "../lib/accountsPayable.interface";

interface Props {
  columns: ColumnDef<AccountPayable, any>[];
  data: AccountPayable[];
  isLoading: boolean;
  page: number;
  perPage: number;
  totalPages: number;
  total: number;
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  children?: React.ReactNode;
}

export default function AccountsPayableTable({
  columns,
  data,
  isLoading,
  page,
  perPage,
  totalPages,
  total,
  sorting,
  onSortingChange,
  onPageChange,
  onPerPageChange,
  rowSelection,
  onRowSelectionChange,
  children,
}: Props) {
  return (
    <div className="space-y-2">
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        sorting={sorting}
        onSortingChange={(updater: Updater<SortingState>) => {
          onSortingChange(
            typeof updater === "function" ? updater(sorting) : updater,
          );
        }}
        manualSorting
        enableRowSelection
        rowSelection={rowSelection}
        onRowSelectionChange={onRowSelectionChange}
        getRowId={(row) => String(row.id)}
      >
        {children}
      </DataTable>
      <DataTablePagination
        page={page}
        per_page={perPage}
        totalPages={totalPages}
        totalData={total}
        onPageChange={onPageChange}
        setPerPage={onPerPageChange}
      />
    </div>
  );
}
