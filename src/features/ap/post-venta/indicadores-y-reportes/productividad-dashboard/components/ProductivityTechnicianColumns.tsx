import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductivityTechnicianDetail } from "../lib/productivityDashboard.interface";
import {
  PRODUCTIVITY_STATUS_BADGE_COLOR,
  PRODUCTIVITY_STATUS_LABEL,
} from "../lib/productivityDashboard.constants";

export type ProductivityTechnicianColumn =
  ColumnDef<ProductivityTechnicianDetail>;

const formatCurrency = (value: number) =>
  `S/ ${new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)}`;

const formatHours = (value: number) =>
  `${new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value)} h`;

export const productivityTechnicianColumns =
  (): ProductivityTechnicianColumn[] => [
    {
      accessorKey: "rank",
      header: "#",
      cell: ({ row }) => {
        const tech = row.original;
        return (
          <div className="flex items-center gap-1.5 font-semibold">
            {tech.rank === 1 && <Trophy className="h-4 w-4 text-amber-500" />}
            {tech.rank}
          </div>
        );
      },
    },
    {
      accessorKey: "worker_name",
      header: "Técnico",
      cell: ({ row }) => {
        const tech = row.original;
        return (
          <div>
            <div className="font-semibold">{tech.worker_name}</div>
            <div className="text-xs text-muted-foreground">
              {tech.worker_dni} · {tech.sede_abbreviation}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "standard_hours",
      header: "Horas estándar",
      cell: ({ row }) => formatHours(row.original.standard_hours),
    },
    {
      accessorKey: "billed_hours",
      header: "Horas facturadas",
      cell: ({ row }) => (
        <span className="font-semibold">
          {formatHours(row.original.billed_hours)}
        </span>
      ),
    },
    {
      accessorKey: "productivity_hours",
      header: "Productividad",
      cell: ({ row }) => {
        const tech = row.original;
        return (
          <span
            className={cn(
              "font-semibold",
              tech.productivity_hours < 0 ? "text-red-600" : "text-green-600",
            )}
          >
            {tech.productivity_hours >= 0 ? "+" : ""}
            {formatHours(tech.productivity_hours)} ·{" "}
            {tech.productivity_percentage}%
          </span>
        );
      },
    },
    {
      accessorKey: "earnings",
      header: "Ganancia",
      cell: ({ row }) => {
        const value = row.original.earnings;
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
        const tech = row.original;
        return (
          <Badge color={PRODUCTIVITY_STATUS_BADGE_COLOR[tech.status]}>
            {PRODUCTIVITY_STATUS_LABEL[tech.status]}
          </Badge>
        );
      },
    },
  ];
