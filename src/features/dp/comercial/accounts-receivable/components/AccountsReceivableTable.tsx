import type {
  ColumnDef,
  SortingState,
  Updater,
  RowSelectionState,
  OnChangeFn,
} from "@tanstack/react-table";
import { DataTable } from "@/shared/components/DataTable";
import DataTablePagination from "@/shared/components/DataTablePagination";
import type { AccountReceivable } from "../lib/accountsReceivable.interface";

interface Props {
  columns: ColumnDef<AccountReceivable, any>[];
  data: AccountReceivable[];
  isLoading: boolean;
  page: number;
  perPage: number;
  totalPages: number;
  total: number;
  sorting: SortingState;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onSortingChange: (sorting: SortingState) => void;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  children?: React.ReactNode;
}

export default function AccountsReceivableTable({
  columns,
  data,
  isLoading,
  page,
  perPage,
  totalPages,
  total,
  sorting,
  onPageChange,
  onPerPageChange,
  onSortingChange,
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
        initialColumnVisibility={{
          cashier: false,
          branch: false,
          sede: false,
        }}
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
