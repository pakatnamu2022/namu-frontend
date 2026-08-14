import { DataTable } from "@/shared/components/DataTable";
import { ActivitiesColumns } from "./ActivitiesColumns";
import { ActivitiesResource } from "../lib/activities.interface";

interface Props {
  columns: ActivitiesColumns[];
  data: ActivitiesResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ActivitiesTable({ columns, data, children, isLoading }: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable columns={columns} data={data} isLoading={isLoading}>
        {children}
      </DataTable>
    </div>
  );
}
