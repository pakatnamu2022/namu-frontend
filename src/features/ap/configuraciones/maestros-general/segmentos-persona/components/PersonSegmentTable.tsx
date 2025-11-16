import { DataTable } from "@/shared/components/DataTable";
import { PersonSegmentColumns } from "./PersonSegmentColumns";
import { PersonSegmentResource } from "../lib/personSegment.interface";

interface Props {
  columns: PersonSegmentColumns[];
  data: PersonSegmentResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function PersonSegmentTable({
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
          description: true,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
