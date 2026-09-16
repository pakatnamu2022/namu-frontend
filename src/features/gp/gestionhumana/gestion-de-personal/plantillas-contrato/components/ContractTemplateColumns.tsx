"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ContractTemplateResource } from "../lib/contractTemplate.interface.ts";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { CONTRACT_TEMPLATE } from "../lib/contractTemplate.constant.ts";

export type ContractTemplateColumns = ColumnDef<ContractTemplateResource>;

export const contractTemplateColumns = ({
  onDelete,
}: {
  onDelete: (id: number) => void;
}): ContractTemplateColumns[] => [
  {
    accessorKey: "nombre",
    header: "Nombre",
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
    cell: ({ row }) => row.original.descripcion ?? "-",
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { ROUTE_UPDATE } = CONTRACT_TEMPLATE;
      const { id } = row.original;

      return (
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="icon" className="size-7">
            <Link to={`${ROUTE_UPDATE}/${id}`}>
              <Pencil className="size-4" />
            </Link>
          </Button>
          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
