"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CycleResource } from "../lib/cycle.interface";
import { Button } from "@/components/ui/button";
import { PanelRightClose, Pencil, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { format, parse } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from "react-router-dom";
import { CYCLE } from "../lib/cycle.constants";

export type CycleColumns = ColumnDef<CycleResource>;
const { ABSOLUTE_ROUTE, ROUTE_UPDATE } = CYCLE;

export const cycleColumns = ({
  onDelete,
}: {
  onDelete: (id: number) => void;
}): CycleColumns[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => {
      const id = row.original.id;
      return (
        <Link
          to={`${ABSOLUTE_ROUTE}/${id}`}
          className="font-semibold underline text-primary"
        >
          {row.original.name}
        </Link>
      );
    },
  },
  {
    header: "Intérvalo del Ciclo",
    accessorFn: (row) => row,
    cell: ({ getValue }) => {
      const cycle = getValue() as CycleResource;
      return (
        <div className="font-semibold">
          <Badge variant="default">
            {format(
              parse(cycle.start_date as string, "yyyy-MM-dd", new Date()),
              "dd/MM/yyyy"
            )}
          </Badge>
          <span className="mx-1">-</span>
          <Badge variant="default">
            {format(
              parse(cycle.end_date as string, "yyyy-MM-dd", new Date()),
              "dd/MM/yyyy"
            )}
          </Badge>
        </div>
      );
    },
  },
  {
    header: "Categorías Jerárquicas",
    accessorFn: (row) => row,
    cell: ({ getValue }) => {
      const cycle = getValue() as CycleResource;
      const categories = cycle.categories || [];
      const visible = categories.slice(0, 2);
      const hiddenCount = categories.length - visible.length;

      return (
        <div className="font-semibold flex items-center gap-1">
          {visible.map((category) => (
            <Tooltip key={category.hierarchical_category_id}>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="max-w-24 px-0">
                  <div className="truncate overflow-hidden whitespace-nowrap px-2">
                    {category.hierarchical_category}
                  </div>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{category.hierarchical_category}</p>
              </TooltipContent>
            </Tooltip>
          ))}

          {hiddenCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  {hiddenCount}
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-64">
                <ul className="text-xs space-y-1 max-h-32 overflow-y-auto">
                  {categories.map((category, index) => (
                    <li key={category.hierarchical_category_id}>
                      {index + 1}. {category.hierarchical_category}
                    </li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "typeEvaluationName",
    header: "Tipo de Evaluación",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      return (
        <div className="font-semibold">
          <Badge variant={"tertiary"}>{status}</Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "parameter",
    header: "Parámetro de Objetivos",
    cell: ({ row }) => {
      const parameter = (row.original as CycleResource).parameter
        .name as string;
      return (
        <div className="font-semibold">
          <Badge variant="outline">{parameter}</Badge>
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
          {/* PanelRightClose  */}
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            tooltip="Ver detalles del ciclo"
            onClick={() => router(`${ABSOLUTE_ROUTE}/${id}`)}
          >
            <PanelRightClose className="size-5" />
          </Button>

          {/* Edit */}
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            tooltip="Editar ciclo"
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
