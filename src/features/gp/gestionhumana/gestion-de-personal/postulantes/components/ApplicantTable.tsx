import { DataTable } from "@/shared/components/DataTable";
import { ApplicantColumns } from "./ApplicantColumns.tsx";
import { ApplicantResource } from "../lib/applicant.interface.ts";

interface Props {
  columns: ApplicantColumns[];
  data: ApplicantResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ApplicantTable({
  columns,
  data,
  children,
  isLoading,
}: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable columns={columns} data={data} isLoading={isLoading}>
        {children}
      </DataTable>
    </div>
  );
}
