import { DataTable } from "@/shared/components/DataTable";
import { AssignCompanyBranchResource } from "../lib/assignCompanyBranch.interface";
import { AssignCompanyBranchColumns } from "./AssignCompanyBranchColumns";

interface Props {
  columns: AssignCompanyBranchColumns[];
  data: AssignCompanyBranchResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function AssignCompanyBranchTable({
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
          sede: true,
          assigned_workers: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
