"use client";

import { ColumnDef } from "@tanstack/react-table";
import { HierarchicalCategoryResource } from "../lib/hierarchicalCategory.interface";
import { Button } from "@/components/ui/button";
import {
  BookmarkCheck,
  Check,
  CircleAlert,
  Dumbbell,
  Pencil,
  Users2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { DeleteButton } from "@/src/shared/components/SimpleDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type HierarchicalCategoryColumns =
  ColumnDef<HierarchicalCategoryResource>;

export const hierarchicalCategoryColumns = ({
  onDelete,
  onSelected,
  onSelectedForObjective,
  onSelectedForCompetence,
}: {
  onDelete: (id: number) => void;
  onSelected: (category: HierarchicalCategoryResource) => void;
  onSelectedForObjective: (category: HierarchicalCategoryResource) => void;
  onSelectedForCompetence: (category: HierarchicalCategoryResource) => void;
}): HierarchicalCategoryColumns[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => {
      const id = row.original.id;
      const name = row.original.name;
      const issues = row.original.issues;
      const pass = row.original.pass;
      return (
        <div className="flex items-center gap-1">
          <p className="font-bold">{name}</p>
          {!pass && issues && (
            <Badge
              tooltip={
                <div className="text-xs">
                  {issues.map((issue, index) => (
                    <li key={id + index}>{issue}</li>
                  ))}
                </div>
              }
              variant={"ghost"}
              className="font-semibold aspect-square p-1 rounded"
            >
              <CircleAlert className="size-4 text-primary" />
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Descripción",
  },
  {
    accessorKey: "pass",
    header: "Validación",
    cell: ({ getValue }) => (
      <Badge
        variant={(getValue() as boolean) ? "outline" : "outline"}
        className={cn("font-semibold flex gap-0.5 w-fit", {
          "text-tertiary": !getValue(),
          "text-primary": getValue(),
        })}
      >
        {getValue() ? <Check className="size-3" /> : <X className="size-3" />}
        {getValue() ? "Correcta" : "Inválida"}
      </Badge>
    ),
  },
  {
    accessorKey: "excluded_from_evaluation",
    header: "Inclusión",
    cell: ({ getValue }) => (
      <Badge
        variant={(getValue() as boolean) ? "secondary" : "default"}
        className={cn("font-semibold flex gap-0.5 w-fit")}
      >
        {getValue() ? <X className="size-3" /> : <Check className="size-3" />}
        {getValue() ? "Excluida" : "Incluida"}
      </Badge>
    ),
  },
  {
    accessorKey: "hasObjectives",
    header: "Tiene Objetivos",
    cell: ({ getValue }) => (
      <Badge
        variant={(getValue() as boolean) ? "tertiary" : "secondary"}
        className={cn("font-semibold flex gap-0.5 w-fit")}
      >
        {getValue() ? <Check className="size-3" /> : <X className="size-3" />}
        {getValue() ? "Con Objetivos" : "Sin Objetivos"}
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
          {/* Details */}
          <Button
            variant="outline"
            tooltip="Posiciones"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onSelected(row.original)}
          >
            <Users2 className="size-5" />
            <Badge
              variant="tertiary"
              className="size-5 aspect-square !p-0 flex justify-center items-center rounded-full text-xs"
            >
              {row.original.children?.length || 0}
            </Badge>
          </Button>

          {/* Objetivos */}
          <Button
            variant="outline"
            tooltip="Objetivos"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onSelectedForObjective(row.original)}
          >
            <Dumbbell className="size-5" />
            <Badge
              variant="default"
              className="size-5 aspect-square !p-0 flex justify-center items-center rounded-full text-xs"
            >
              {row.original.objectives.length || 0}
            </Badge>
          </Button>

          {/* Competencias */}
          <Button
            variant="outline"
            tooltip="Competencias"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onSelectedForCompetence(row.original)}
          >
            <BookmarkCheck className="size-5" />
            <Badge
              variant="default"
              className="size-5 aspect-square !p-0 flex justify-center items-center rounded-full text-xs"
            >
              {row.original.competences.length || 0}
            </Badge>
          </Button>

          {/* Edit */}
          <Button
            variant="outline"
            tooltip="Editar"
            size="icon"
            className="size-7"
            onClick={() =>
              router.push(`./categorias-jerarquicas/actualizar/${id}`)
            }
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
