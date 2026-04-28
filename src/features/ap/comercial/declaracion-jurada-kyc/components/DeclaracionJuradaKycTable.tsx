"use client";

import { DataTable } from "@/shared/components/DataTable";
import { DeclaracionJuradaKycColumn } from "./DeclaracionJuradaKycColumns";
import { CustomerKycDeclarationResource } from "../lib/declaracionJuradaKyc.interface";

interface Props {
  columns: DeclaracionJuradaKycColumn[];
  data: CustomerKycDeclarationResource[];
  isLoading?: boolean;
  children?: React.ReactNode;
}

export default function DeclaracionJuradaKycTable({
  columns,
  data,
  isLoading,
  children,
}: Props) {
  return (
    <div className="border-none text-muted-foreground">
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        initialColumnVisibility={{
          full_name: true,
          num_doc: true,
          declaration_date: true,
          beneficiary_type: true,
          purchase_request_quote_id: true,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
