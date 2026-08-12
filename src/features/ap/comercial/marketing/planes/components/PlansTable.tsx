import { DataTable } from "@/shared/components/DataTable";
import { PlansColumns } from "./PlansColumns";
import { PlansResource } from "../lib/plans.interface";

interface Props {
  columns: PlansColumns[];
  data: PlansResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function PlansTable({ columns, data, children, isLoading }: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable columns={columns} data={data} isLoading={isLoading}>
        {children}
      </DataTable>
    </div>
  );
}
