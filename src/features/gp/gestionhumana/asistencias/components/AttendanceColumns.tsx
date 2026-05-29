import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AttendanceRecord } from "../lib/attendance.interface";
import { MARK_TYPE_LABELS, MARK_TYPE_COLORS } from "../lib/attendance.constants";

interface ColumnsOptions {
  onRowClick: (row: AttendanceRecord) => void;
}

export function getAttendanceColumns({
  onRowClick,
}: ColumnsOptions): ColumnDef<AttendanceRecord>[] {
  return [
    {
      id: "emp_code",
      accessorKey: "emp_code",
      header: "Código",
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.emp_code}</span>
      ),
    },
    {
      id: "full_name",
      accessorKey: "full_name",
      header: "Colaborador",
      cell: ({ row }) => (
        <button
          className="text-primary font-medium hover:underline text-left"
          onClick={() => onRowClick(row.original)}
        >
          {row.original.full_name}
        </button>
      ),
    },
    {
      id: "date",
      accessorKey: "date",
      header: "Fecha",
      cell: ({ row }) => (
        <span className="tabular-nums text-sm">{row.original.date}</span>
      ),
    },
    {
      id: "mark_type",
      accessorKey: "mark_type",
      header: "Tipo",
      cell: ({ row }) => {
        const type = row.original.mark_type;
        const label = MARK_TYPE_LABELS[type] ?? type;
        const colorClass = MARK_TYPE_COLORS[type] ?? "bg-gray-100 text-gray-700 border-gray-200";
        return (
          <Badge variant="outline" className={cn("text-xs border", colorClass)}>
            {label}
          </Badge>
        );
      },
    },
    {
      id: "time",
      accessorKey: "time",
      header: "Hora",
      cell: ({ row }) => (
        <span className="tabular-nums font-medium text-sm">
          {row.original.time?.slice(0, 5) ?? "-"}
        </span>
      ),
    },
    {
      id: "area",
      accessorKey: "area",
      header: "Área",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.area ?? "-"}
        </span>
      ),
    },
    {
      id: "person_id",
      header: "Vinculado",
      cell: ({ row }) => (
        <span
          className={cn(
            "text-xs font-medium",
            row.original.person_id ? "text-green-600" : "text-amber-600",
          )}
        >
          {row.original.person_id ? "Sí" : "Sin match"}
        </span>
      ),
    },
  ];
}
