"use client";

import { ReactNode } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/shared/components/DataTable";
import { TelephonePlanResource } from "../lib/telephonePlan.interface";

interface TelephonePlanTableProps {
  data: TelephonePlanResource[];
  columns: ColumnDef<TelephonePlanResource>[];
  isLoading?: boolean;
  children?: ReactNode;
}

export default function TelephonePlanTable({
  data,
  columns,
  isLoading,
  children,
}: TelephonePlanTableProps) {
  return (
    <DataTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      children={children}
    />
  );
}
