import { DataTable } from "@/shared/components/DataTable";
import { CampaignScheduleColumns } from "./CampaignScheduleColumns";
import { CampaignScheduleResource } from "../lib/campaignSchedule.interface";

interface Props {
  columns: CampaignScheduleColumns[];
  data: CampaignScheduleResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function CampaignScheduleTable({
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
