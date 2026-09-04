import { DataTable } from "@/shared/components/DataTable";
import { RecruitmentProcessColumns } from "./RecruitmentProcessColumns.tsx";
import { RecruitmentProcessResource } from "../lib/recruitmentProcess.interface.ts";

interface Props {
  columns: RecruitmentProcessColumns[];
  data: RecruitmentProcessResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function RecruitmentProcessTable({
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
