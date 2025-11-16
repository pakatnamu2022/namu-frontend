import { DataTable } from "@/shared/components/DataTable";
import { StoreVisitsResource } from "../lib/storeVisits.interface";
import { StoreVisitsColumns } from "./StoreVisitsColumns";
import StoreVisitsCard from "./StoreVisitsCard";

interface Props {
  columns: StoreVisitsColumns[];
  data: StoreVisitsResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
  onDelete: (id: number) => void;
}

export default function VehicleCategoryTable({
  columns,
  data,
  children,
  isLoading,
  onDelete,
}: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        initialColumnVisibility={{
          registration_date: true,
          sede: true,
          full_name: true,
          phone: true,
          email: false,
          vehicle_brand: true,
          document_type: false,
          num_doc: false,
        }}
        mobileCardRender={(row, index) => (
          <StoreVisitsCard
            data={row}
            index={index}
            onDelete={onDelete}
            enableContactIcons={true}
          />
        )}
      >
        {children}
      </DataTable>
    </div>
  );
}
