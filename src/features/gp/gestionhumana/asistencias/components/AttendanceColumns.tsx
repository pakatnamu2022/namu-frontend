import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AttendanceRecord } from "../lib/attendance.interface";
import {
  MARK_TYPE_LABELS,
  MARK_TYPE_COLORS,
} from "../lib/attendance.constants";

interface ColumnsOptions {
  onRowClick: (row: AttendanceRecord) => void;
  personBaseRoute: string;
}

export function getAttendanceColumns({
  onRowClick,
  personBaseRoute,
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
          className="text-primary dark:text-primary-foreground font-medium hover:underline text-left"
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
        const colorClass = MARK_TYPE_COLORS[type] ?? "gray";
        return (
          <Badge color={colorClass} size="sm">
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
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => {
        const pid = row.original.person_id;
        if (!pid) return null;
        return (
          <Button asChild size="sm" variant="ghost" className="h-7 px-2">
            <Link to={`${personBaseRoute}/${pid}`}>
              <User className="size-3.5 mr-1" />
              Ver persona
            </Link>
          </Button>
        );
      },
    },
  ];
}
