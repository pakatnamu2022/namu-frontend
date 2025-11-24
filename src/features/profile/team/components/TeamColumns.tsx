"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Check, ShieldQuestion, History, Edit } from "lucide-react";
import { EvaluationPersonResultResource } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/lib/evaluationPerson.interface";
import { Badge } from "@/components/ui/badge";
import { getMyEvaluatorTypes } from "../lib/teamHelpers";
import { getEvaluatorTypeById } from "../lib/teamConstants";
import { useAuthStore } from "@/features/auth/lib/auth.store";

export type TeamColumns = ColumnDef<EvaluationPersonResultResource>;

export const teamColumns = ({
  onEvaluate,
  onHistory,
}: {
  onEvaluate: (personId: number) => void;
  onHistory: (personId: number) => void;
}): TeamColumns[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => {
      const name = row.original.person.name;
      return (
        <div className="flex items-center gap-2">
          <span className="font-bold">{name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "position",
    accessorFn: (row) => row.person.position,
    header: "Posición",
  },
  {
    id: "my_roles",
    header: "Mi Rol",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { user } = useAuthStore();
      const myTypes = getMyEvaluatorTypes(row.original, user?.partner_id);

      if (myTypes.length === 0) {
        return <span className="text-muted-foreground text-xs">-</span>;
      }

      return (
        <div className="flex flex-wrap gap-1">
          {myTypes.map((typeId) => {
            const typeConfig = getEvaluatorTypeById(typeId);
            if (!typeConfig) return null;

            const Icon = typeConfig.icon;

            return (
              <Badge
                key={typeId}
                variant={typeConfig.color}
                className="text-xs gap-1"
              >
                <Icon className="h-3 w-3" />
                {typeConfig.shortName}
              </Badge>
            );
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "sede",
    accessorFn: (row) => row.person.sede,
    header: "Sede",
  },
  {
    accessorKey: "objectivesResult",
    header: "Resultado de Objetivos",
  },
  {
    accessorKey: "competencesResult",
    header: "Resultado de Competencias",
  },
  {
    accessorKey: "result",
    header: "Resultado",
    cell: ({ row }) => {
      const result = row.original.result;
      return <Badge className="font-bold">{result}%</Badge>;
    },
  },
  {
    accessorKey: "overall_completion_rate",
    header: "Progreso",
    cell: ({ row }) => {
      const overallCompletionRate =
        row.original.statistics.overall_completion_rate;
      return (
        <Badge variant={"outline"} className="font-bold">
          {overallCompletionRate}%
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const isEvaluated =
        row.original.statistics.overall_completion_rate === 100;
      const isPending =
        row.original.statistics.overall_completion_rate < 100 &&
        row.original.statistics.overall_completion_rate > 0;
      return (
        <div className="flex items-center gap-2">
          <Badge variant={isEvaluated ? "default" : "destructive"}>
            <p>
              {isEvaluated
                ? "Evaluado"
                : isPending
                ? "Pendiente"
                : "No Evaluado  "}
            </p>
            {isEvaluated ? (
              <Check className="size-4" />
            ) : (
              <ShieldQuestion className="size-4" />
            )}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const personId = row.original.person.id;
      const isEvaluated =
        row.original.statistics.overall_completion_rate === 100;
      const isPending =
        row.original.statistics.overall_completion_rate < 100 &&
        row.original.statistics.overall_completion_rate > 0;

      return (
        <div className="flex items-center gap-2">
          {/* Evaluar */}
          <Button
            size="sm"
            variant={isEvaluated ? "outline" : "default"}
            className="h-7 gap-1"
            onClick={() => {
              onEvaluate(personId);
            }}
          >
            {isEvaluated ? "Ver Activa" : isPending ? "Continuar" : "Evaluar"}
            <Edit className="size-4" />
          </Button>

          {/* Historial */}
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1"
            onClick={() => {
              onHistory(personId);
            }}
          >
            Historial
            <History className="size-4" />
          </Button>
        </div>
      );
    },
  },
];
