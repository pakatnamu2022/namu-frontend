import { DataTable } from "@/shared/components/DataTable";
import { LeaderStatusColumn } from "./LeadersStatusColumns";
import type { Leader, LeaderStatusSummary } from "../lib/evaluationPerson.interface";
import { Badge } from "@/components/ui/badge";

interface Props {
  columns: LeaderStatusColumn[];
  data: Leader[];
  summary?: LeaderStatusSummary;
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function LeadersStatusTable({
  columns,
  data,
  summary,
  children,
  isLoading,
}: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      {summary && (
        <div className="flex gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Total Líderes:</span>
            <Badge color="sky">{summary.total_leaders}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Completados:</span>
            <Badge color="green">{summary.completed}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">En Progreso:</span>
            <Badge color="amber">{summary.in_progress}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sin Iniciar:</span>
            <Badge color="gray">{summary.not_started}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Progreso General:</span>
            <Badge color="default">{summary.completion_percentage.toFixed(0)}%</Badge>
          </div>
        </div>
      )}
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        initialColumnVisibility={{
          dni: false,
          sede: false,
          area: false,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
