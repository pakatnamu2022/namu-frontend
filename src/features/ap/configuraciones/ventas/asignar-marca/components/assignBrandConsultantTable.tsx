import { DataTable } from "@/src/shared/components/DataTable";
import { AssignBrandConsultantColumns } from "./assignBrandConsultantColumns";
import { AssignBrandConsultantResource } from "../lib/assignBrandConsultant.interface";

interface Props {
  columns: AssignBrandConsultantColumns[];
  data: AssignBrandConsultantResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
  isVisibleColumnFilter?: boolean;
}

export default function AssignBrandConsultantTable({
  columns,
  data,
  children,
  isLoading,
  isVisibleColumnFilter = true,
}: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        initialColumnVisibility={{
          period: false,
          company_branch: true,
          brand: true,
          worker: true,
          sales_target: true,
        }}
        isVisibleColumnFilter={isVisibleColumnFilter}
      >
        {children}
      </DataTable>
    </div>
  );
}
