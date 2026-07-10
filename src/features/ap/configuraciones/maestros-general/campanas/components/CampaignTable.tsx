import { DataTable } from "@/shared/components/DataTable";
import { CampaignColumns } from "./CampaignColumns";
import { CampaignResource } from "../lib/campaign.interface";

interface Props {
  columns: CampaignColumns[];
  data: CampaignResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function CampaignTable({
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
          code: true,
          name: true,
          area: true,
          start_date: true,
          end_date: true,
          discount_type: true,
          discount_value: true,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
