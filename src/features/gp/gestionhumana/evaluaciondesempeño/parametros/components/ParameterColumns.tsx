"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ParameterResource } from "../lib/parameter.interface";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PARAMETER } from "../lib/parameter.constans";
import { getScales } from "../lib/parameter.hook";

const { ROUTE_UPDATE } = PARAMETER;

export type ParameterColumns = ColumnDef<ParameterResource>;

export const parameterColumns = ({
  onDelete,
}: {
  onDelete: (id: number) => void;
}): ParameterColumns[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "details",
    header: "Rangos",
    cell: ({ row }) => {
      const details = row.original.details;

      const scales = getScales(details.length);

      return (
        <div className="flex gap-2">
          {details.map((detail, index) => (
            <Badge
              variant={"ghost"}
              className={cn(scales[index])}
              key={detail.id}
            >
              {detail.label}| {detail.from} - {detail.to}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const router = useNavigate();
      const id = row.original.id;

      return (
        <div className="flex items-center gap-2">
          {/* Edit */}
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => router(`${ROUTE_UPDATE}/${id}`)}
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
