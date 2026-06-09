"use client";

import { ColumnDef } from "@tanstack/react-table";
import { InsuranceResource } from "../lib/insurance.interface";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";

export type InsuranceColumns = ColumnDef<InsuranceResource>;

export const insuranceColumns = ({
  onDelete,
}: {
  onDelete: (id: number) => void;
}): InsuranceColumns[] => [
  {
    accessorKey: "worker",
    header: "Trabajador",
    cell: ({ getValue }) => (
      <span className="font-semibold">{(getValue() as string) ?? "—"}</span>
    ),
  },
  {
    accessorKey: "period",
    header: "Periodo",
    cell: ({ getValue }) => <span>{(getValue() as string) ?? "—"}</span>,
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
    cell: ({ getValue }) => (
      <span className="font-mono text-sm">{(getValue() as string) ?? "—"}</span>
    ),
  },
  {
    accessorKey: "contracting_name",
    header: "Contratante",
    cell: ({ getValue }) => <span>{(getValue() as string) ?? "—"}</span>,
  },
  {
    accessorKey: "num_doc_contracting",
    header: "N° Doc. Contratante",
    cell: ({ getValue }) => (
      <span className="font-mono text-sm">{(getValue() as string) ?? "—"}</span>
    ),
  },
  {
    accessorKey: "rate_with_tax",
    header: "Tasa c/ IGV",
    cell: ({ getValue }) => {
      const val = getValue() as number;
      return (
        <span className="font-mono">
          S/{" "}
          {val?.toLocaleString("es-PE", { minimumFractionDigits: 2 }) ?? "0.00"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { id } = row.original;
      return (
        <div className="flex items-center gap-2">
          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
