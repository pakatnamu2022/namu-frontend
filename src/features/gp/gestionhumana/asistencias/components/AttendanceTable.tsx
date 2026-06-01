import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/shared/components/DataTable";
import DataTablePagination from "@/shared/components/DataTablePagination";
import type { AttendanceRecord } from "../lib/attendance.interface";

interface Props {
  columns: ColumnDef<AttendanceRecord, any>[];
  data: AttendanceRecord[];
  isLoading: boolean;
  page: number;
  perPage: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  children?: React.ReactNode;
}

export default function AttendanceTable({
  columns,
  data,
  isLoading,
  page,
  perPage,
  totalPages,
  total,
  onPageChange,
  onPerPageChange,
  children,
}: Props) {
  return (
    <div className="space-y-2">
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
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
