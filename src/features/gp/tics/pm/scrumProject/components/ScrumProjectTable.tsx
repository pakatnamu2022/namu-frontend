import { DataTable } from "@/shared/components/DataTable";
import { ScrumProjectColumns } from "./ScrumProjectColumns";
import { ScrumProjectResource } from "../lib/scrumProject.interface";

interface Props {
  columns: ScrumProjectColumns[];
  data: ScrumProjectResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ScrumProjectTable({ columns, data, children, isLoading }: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable columns={columns} data={data} isLoading={isLoading}>
        {children}
      </DataTable>
    </div>
  );
}
