import { DataTable } from "@/shared/components/DataTable";
import { ProposalsColumns } from "./ProposalsColumns";
import { ProposalsResource } from "../lib/proposals.interface";

interface Props {
  columns: ProposalsColumns[];
  data: ProposalsResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ProposalsTable({ columns, data, children, isLoading }: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable columns={columns} data={data} isLoading={isLoading}>
        {children}
      </DataTable>
    </div>
  );
}
