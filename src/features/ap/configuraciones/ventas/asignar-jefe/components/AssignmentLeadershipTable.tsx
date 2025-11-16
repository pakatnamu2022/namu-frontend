import { DataTable } from "@/shared/components/DataTable";
import { AssignmentLeadershipResource } from "../lib/assignmentLeadership.interface";
import { AssignmentLeadershipColumns } from "./AssignmentLeadershipColumns";

interface Props {
  columns: AssignmentLeadershipColumns[];
  data: AssignmentLeadershipResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function AssignmentLeadershipTable({
  columns,
  data,
  children,
  isLoading,
}: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        initialColumnVisibility={{
          period: false,
          boss_name: true,
          boss_position: true,
          assigned_workers: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
