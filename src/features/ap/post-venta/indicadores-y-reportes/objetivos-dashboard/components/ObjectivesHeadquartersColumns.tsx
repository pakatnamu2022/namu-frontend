import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { HeadquarterSummary } from "../lib/objectivesDashboard.interface";
import {
  OBJECTIVE_STATUS_BADGE_COLOR,
  OBJECTIVE_STATUS_LABEL,
} from "../lib/objectivesDashboard.constants";

export type ObjectivesHeadquartersColumn = ColumnDef<HeadquarterSummary>;

interface Props {
  onRowClick: (sede: HeadquarterSummary) => void;
}

const cellClickClass = "cursor-pointer -m-2 p-2";

const formatCurrency = (value: number) =>
  `S/ ${new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)}`;

export const objectivesHeadquartersColumns = ({
  onRowClick,
}: Props): ObjectivesHeadquartersColumn[] => [
  {
    accessorKey: "rank",
    header: "#",
    cell: ({ row }) => {
      const sede = row.original;
      return (
        <div onClick={() => onRowClick(sede)} className={cellClickClass}>
          <div className="flex items-center gap-1.5 font-semibold">
            {sede.rank === 1 && <Trophy className="h-4 w-4 text-amber-500" />}
            {sede.rank}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Sede",
    cell: ({ row }) => {
      const sede = row.original;
      return (
        <div onClick={() => onRowClick(sede)} className={cellClickClass}>
          <div className="font-semibold">{sede.name}</div>
          <div className="text-xs text-muted-foreground">{sede.abbreviation}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "total_objective",
    header: "Objetivo",
    cell: ({ row }) => (
      <div onClick={() => onRowClick(row.original)} className={cellClickClass}>
        {formatCurrency(row.original.total_objective)}
      </div>
    ),
  },
  {
    accessorKey: "total_progress",
    header: "Avance",
    cell: ({ row }) => (
      <div onClick={() => onRowClick(row.original)} className={cellClickClass}>
        <span className="font-semibold">
          {formatCurrency(row.original.total_progress)}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "completion_percentage",
    header: "Cumplimiento",
    cell: ({ row }) => {
      const sede = row.original;
      return (
        <div
          onClick={() => onRowClick(sede)}
          className={cn(cellClickClass, "space-y-1 min-w-[120px]")}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">
              {sede.completion_percentage}%
            </span>
          </div>
          <Progress value={Math.min(sede.completion_percentage, 100)} className="h-1.5" />
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const sede = row.original;
      return (
        <div onClick={() => onRowClick(sede)} className={cellClickClass}>
          <Badge color={OBJECTIVE_STATUS_BADGE_COLOR[sede.status]}>
            {OBJECTIVE_STATUS_LABEL[sede.status]}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div onClick={() => onRowClick(row.original)} className={cellClickClass}>
        <ChevronRight className="h-5 w-5" />
      </div>
    ),
  },
];
