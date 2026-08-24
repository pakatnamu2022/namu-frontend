import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatHours } from "@/core/core.function";
import { ProductivityHeadquarterSummary } from "../lib/productivityDashboard.interface";
import {
  PRODUCTIVITY_STATUS_BADGE_COLOR,
  PRODUCTIVITY_STATUS_LABEL,
} from "../lib/productivityDashboard.constants";

export type ProductivityHeadquartersColumn =
  ColumnDef<ProductivityHeadquarterSummary>;

const formatCurrency = (value: number) =>
  `S/ ${new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)}`;

export const productivityHeadquartersColumns =
  (): ProductivityHeadquartersColumn[] => [
    {
      accessorKey: "rank",
      header: "#",
      cell: ({ row }) => {
        const sede = row.original;
        return (
          <div className="flex items-center gap-1.5 font-semibold">
            {sede.rank === 1 && <Trophy className="h-4 w-4 text-amber-500" />}
            {sede.rank}
          </div>
        );
      },
    },
    {
      accessorKey: "sede_name",
      header: "Sede",
      cell: ({ row }) => {
        const sede = row.original;
        return (
          <div>
            <div className="font-semibold">{sede.sede_name}</div>
            <div className="text-xs text-muted-foreground">
              {sede.sede_abbreviation} · {sede.technician_count} técnicos
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "total_standard_hours",
      header: "Horas estándar",
      cell: ({ row }) => formatHours(row.original.total_standard_hours),
    },
    {
      accessorKey: "total_billed_hours",
      header: "Horas facturadas",
      cell: ({ row }) => (
        <span className="font-semibold">
          {formatHours(row.original.total_billed_hours)}
        </span>
      ),
    },
    {
      accessorKey: "total_productivity_hours",
      header: "Productividad",
      cell: ({ row }) => {
        const value = row.original.total_productivity_hours;
        return (
          <span
            className={cn(
              "font-semibold",
              value < 0 ? "text-red-600" : "text-green-600",
            )}
          >
            {value >= 0 ? "+" : "-"}
            {formatHours(Math.abs(value))}
          </span>
        );
      },
    },
    {
      accessorKey: "total_earnings",
      header: "Ganancia",
      cell: ({ row }) => {
        const value = row.original.total_earnings;
        return (
          <span className={cn(value < 0 ? "text-red-600" : "")}>
            {formatCurrency(value)}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const sede = row.original;
        return (
          <Badge color={PRODUCTIVITY_STATUS_BADGE_COLOR[sede.status]}>
            {PRODUCTIVITY_STATUS_LABEL[sede.status]}
          </Badge>
        );
      },
    },
  ];
