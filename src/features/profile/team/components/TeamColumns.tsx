"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { EvaluationPersonResultResource } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/lib/evaluationPerson.interface";
import { TeamCard } from "./TeamCard";

export type TeamColumns = ColumnDef<EvaluationPersonResultResource>;

export const teamColumns = ({
  onEvaluate,
  onHistory,
}: {
  onEvaluate: (personId: number) => void;
  onHistory: (personId: number) => void;
}): TeamColumns[] => [
  {
    id: "employee_card",
    header: "Evaluación de Desempeño",
    cell: ({ row }) => {
      return (
        <TeamCard
          data={row.original}
          onEvaluate={onEvaluate}
          onHistory={onHistory}
        />
      );
    },
  },
];
