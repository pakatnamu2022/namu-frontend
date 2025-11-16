"use client";

import { DataTable } from "@/src/shared/components/DataTable";
import { VehiclesDeliveryResource } from "../lib/vehicleDelivery.interface";
import { ColumnDef } from "@tanstack/react-table";
import { ReactNode } from "react";

interface VehicleDeliveryTableProps {
  data: VehiclesDeliveryResource[];
  columns: ColumnDef<VehiclesDeliveryResource>[];
  isLoading?: boolean;
  children?: ReactNode;
}

export default function VehicleDeliveryTable({
  data,
  columns,
  isLoading = false,
  children,
}: VehicleDeliveryTableProps) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable
        data={data}
        columns={columns}
        isLoading={isLoading}
        initialColumnVisibility={{
          advisor_name: true,
          vin: true,
          scheduled_delivery_date: true,
          wash_date: true,
          status_wash: true,
          status_delivery: true,
          status_nubefact: false,
          status_sunat: false,
          status_dynamic: false,
          observations: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
