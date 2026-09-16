import { DataTable } from "@/shared/components/DataTable";
import { InterviewColumns } from "./InterviewColumns.tsx";
import { InterviewResource } from "../lib/interview.interface.ts";

interface Props {
  columns: InterviewColumns[];
  data: InterviewResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function InterviewTable({ columns, data, children, isLoading }: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable columns={columns} data={data} isLoading={isLoading}>
        {children}
      </DataTable>
    </div>
  );
}
