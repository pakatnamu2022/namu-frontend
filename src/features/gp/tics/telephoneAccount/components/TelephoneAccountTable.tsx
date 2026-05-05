"use client";

import { ReactNode } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/shared/components/DataTable";
import { TelephoneAccountResource } from "../lib/telephoneAccount.interface";

interface TelephoneAccountTableProps {
  data: TelephoneAccountResource[];
  columns: ColumnDef<TelephoneAccountResource>[];
  isLoading?: boolean;
  children?: ReactNode;
}

export default function TelephoneAccountTable({
  data,
  columns,
  isLoading,
  children,
}: TelephoneAccountTableProps) {
  return (
    <DataTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      children={children}
    />
  );
}
