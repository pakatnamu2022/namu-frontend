"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { EvaluationPersonCompetenceDetailResource } from "../lib/evaluationPersonCompetenceDetail.interface";
import { EVALUATOR_TYPES } from "../lib/evaluation.constans";

export type EvaluationCompetenceDetailColumn =
  ColumnDef<EvaluationPersonCompetenceDetailResource>;

const evaluatorTypeColors = ["blue", "indigo", "amber", "emerald"] as const;

export const EvaluationCompetenceDetailColumns =
  (): EvaluationCompetenceDetailColumn[] => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Seleccionar todo"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Seleccionar fila"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "person",
      header: "Colaborador",
    },
    {
      accessorKey: "evaluator",
      header: "Evaluador",
    },
    {
      accessorKey: "competence",
      header: "Competencia",
    },
    {
      accessorKey: "sub_competence",
      header: "Sub-competencia",
    },
    {
      accessorKey: "evaluatorType",
      header: "Tipo de Evaluador",
      cell: ({ getValue }) => {
        const type = getValue() as number;
        const color = evaluatorTypeColors[type] ?? "muted";
        const label =
          EVALUATOR_TYPES.find((t) => t.value === type.toString())?.label ??
          "-";
        return (
          <Badge color={color} className="text-xs">
            {typeof label === "function" ? label() : label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "result",
      header: "Resultado",
      cell: ({ getValue }) => (
        <span className="font-semibold">{getValue() as string}</span>
      ),
    },
  ];
