"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PeriodResource } from "../lib/period.interface";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { DeleteButton } from "@/src/shared/components/SimpleDeleteDialog";
import { Badge } from "@/components/ui/badge";

export type PeriodColumns = ColumnDef<PeriodResource>;

export const periodColumns = ({
  onDelete,
}: {
  onDelete: (id: number) => void;
}): PeriodColumns[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "start_date",
    header: "Fecha de Inicio",
  },
  {
    accessorKey: "end_date",
    header: "Fecha de Fin",
  },
  {
    accessorKey: "active",
    header: "Estado",
    cell: ({ getValue }) => (
      <Badge variant={getValue() ? "default" : "tertiary"}>
        {getValue() ? "Activo" : "Inactivo"}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const router = useRouter();
      const id = row.original.id;

      return (
        <div className="flex items-center gap-2">
          {/* Edit */}
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => router.push(`./periodos/actualizar/${id}`)}
          >
            <Pencil className="size-5" />
          </Button>
          {/* Delete */}
          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
