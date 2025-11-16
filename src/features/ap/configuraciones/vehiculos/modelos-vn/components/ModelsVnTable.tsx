import { DataTable } from "@/src/shared/components/DataTable";
import { ModelsVnResource } from "../lib/modelsVn.interface";
import { ModelsVnColumns } from "./ModelsVnColumns";

interface Props {
  columns: ModelsVnColumns[];
  data: ModelsVnResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function VehicleCategoryTable({
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
          version: true,
          power: false,
          model_year: true,
          wheelbase: false,
          axles_number: false,
          width: false,
          length: false,
          height: false,
          seats_number: false,
          doors_number: false,
          net_weight: false,
          gross_weight: false,
          payload: false,
          displacement: false,
          cylinders_number: false,
          passengers_number: false,
          wheels_number: false,
          distributor_price: true,
          transport_cost: false,
          other_amounts: false,
          purchase_discount: false,
          igv_amount: false,
          total_purchase_excl_igv: false,
          total_purchase_incl_igv: false,
          sale_price: true,
          margin: false,
          brand_id: false,
          brand: true,
          family_id: false,
          family: false,
          class_id: false,
          class: true,
          fuel_id: false,
          fuel: false,
          vehicle_type_id: false,
          vehicle_type: true,
          body_type_id: false,
          body_type: false,
          traction_type_id: false,
          traction_type: false,
          transmission_id: false,
          transmission: false,
          currency_type_id: false,
          currency_type: false,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
