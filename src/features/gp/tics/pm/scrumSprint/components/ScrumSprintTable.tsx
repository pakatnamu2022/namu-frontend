import { DataTable } from "@/shared/components/DataTable";
import { ScrumSprintColumns } from "./ScrumSprintColumns";
import { ScrumSprintResource } from "../lib/scrumSprint.interface";

interface Props {
  columns: ScrumSprintColumns[];
  data: ScrumSprintResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ScrumSprintTable({ columns, data, children, isLoading }: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable columns={columns} data={data} isLoading={isLoading}>
        {children}
      </DataTable>
    </div>
  );
}
