import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AttendanceInternalRow } from "../lib/attendance.interface";

export function getInternalReportColumns(
  personBaseRoute: string,
): ColumnDef<AttendanceInternalRow>[] {
  return [
    {
      accessorKey: "emp_code",
      header: "Código",
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.emp_code}</span>
      ),
    },
    {
      accessorKey: "full_name",
      header: "Nombre",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.full_name}</span>
      ),
    },
    {
      accessorKey: "days_present",
      header: "Días Presentes",
      cell: ({ row }) => (
        <span className="tabular-nums text-sm">{row.original.days_present}</span>
      ),
    },
    {
      accessorKey: "expected_hours",
      header: "H. Esperadas",
      cell: ({ row }) => (
        <span className="tabular-nums text-sm">
          {parseFloat(row.original.expected_hours).toFixed(2)}h
        </span>
      ),
    },
    {
      accessorKey: "hours_worked",
      header: "H. Trabajadas",
      cell: ({ row }) => (
        <span className="tabular-nums text-sm">
          {parseFloat(row.original.hours_worked).toFixed(2)}h
        </span>
      ),
    },
    {
      accessorKey: "balance",
      header: "Balance",
      cell: ({ row }) => {
        const b = parseFloat(row.original.balance);
        return (
          <span
            className={cn(
              "tabular-nums text-sm font-medium",
              b >= 0 ? "text-green-600" : "text-red-600",
            )}
          >
            {b >= 0 ? "+" : ""}
            {b.toFixed(2)}h
          </span>
        );
      },
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
