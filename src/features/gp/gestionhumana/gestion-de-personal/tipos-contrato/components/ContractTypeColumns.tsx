"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ContractTypeResource } from "../lib/contractType.interface.ts";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { CONTRACT_TYPE } from "../lib/contractType.constant.ts";

export type ContractTypeColumns = ColumnDef<ContractTypeResource>;

export const contractTypeColumns = ({
  onDelete,
}: {
  onDelete: (id: number) => void;
}): ContractTypeColumns[] => [
  {
    accessorKey: "descripcion",
    header: "Descripción",
  },
  {
    accessorKey: "anios",
    header: "Años",
    cell: ({ row }) => row.original.anios ?? "-",
  },
  {
    accessorKey: "dias_vacaciones",
    header: "Días de Vacaciones",
    cell: ({ row }) => row.original.dias_vacaciones ?? "-",
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { ROUTE_UPDATE } = CONTRACT_TYPE;
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
