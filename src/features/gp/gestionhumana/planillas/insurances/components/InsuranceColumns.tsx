"use client";

import { ColumnDef } from "@tanstack/react-table";
import { InsuranceResource } from "../lib/insurance.interface";
import { formatMoney, formatPeriod } from "@/core/core.function";

export type InsuranceColumns = ColumnDef<InsuranceResource>;

export const insuranceColumns = (): InsuranceColumns[] => [
  {
    accessorKey: "period",
    header: "Periodo",
    cell: ({ row }) => (
      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/20">
        {formatPeriod(row.original.period)}
      </span>
    ),
  },
  {
    accessorKey: "worker",
    header: "Trabajador",
    cell: ({ getValue }) => (
      <span className="font-semibold">{(getValue() as string) ?? "—"}</span>
    ),
  },
  {
    accessorKey: "business_partner",
    header: "Aseguradora",
    cell: ({ getValue }) => (
      <span className="text-wrap line-clamp-1">
        {(getValue() as string) ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "doc_number_affiliate",
    header: "N° Doc. Afiliado",
  },
  {
    accessorKey: "contracting_name",
    header: "Contratante",
    cell: ({ getValue }) => <span>{(getValue() as string) ?? "—"}</span>,
  },
  {
    accessorKey: "num_doc_contracting",
    header: "N° Doc. Contratante",
  },
  {
    accessorKey: "rate_with_tax",
    header: "Tasa c/ IGV",
    cell: ({ getValue }) => {
      const val = getValue() as number;
      return formatMoney(val);
    },
  },
];
