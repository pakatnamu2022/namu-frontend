import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ExternalLink } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/shared/components/DataTable";
import { EvaluationPersonResultResource } from "../../evaluation-person/lib/evaluationPerson.interface";

export interface PersonResultsAccordionProps {
  data: EvaluationPersonResultResource[];
  isLoading: boolean;
  error?: Error | null;
}

const PersonResultsAccordion: React.FC<PersonResultsAccordionProps> = ({
  data,
  isLoading,
  error,
}) => {
  const router = useNavigate();

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-primary";
    if (percentage >= 60) return "bg-tertiary";
    return "bg-secondary";
  };

  const getStatusBadge = (result: EvaluationPersonResultResource) => {
    const hasCompleted =
      result.competencesResult > 0 && result.objectivesResult > 0;
    const hasProgress =
      result.competencesPercentage > 0 || result.objectivesPercentage > 0;

    if (hasCompleted) {
      return (
        <Badge variant="default" className="bg-primary text-primary">
          Completada
        </Badge>
      );
    }
    if (hasProgress) {
      return <Badge variant="tertiary">En Progreso</Badge>;
    }
    return (
      <Badge variant="outline" className="bg-secondary text-secondary">
        Sin Iniciar
      </Badge>
    );
  };

  const columns = useMemo<ColumnDef<EvaluationPersonResultResource>[]>(
    () => [
      {
        accessorKey: "person.name",
        header: "Persona",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-sm">
              {row.original.person.name}
            </div>
            <div className="text-xs text-muted-foreground">
              {row.original.person.position || "Sin cargo"}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => getStatusBadge(row.original),
        enableSorting: false,
      },
      {
        accessorKey: "total_progress.completion_rate",
        header: "Progreso Total",
        cell: ({ row }) => {
          const percentage =
            Number(
              row.original.total_progress.completion_rate.toFixed(2)
            ) * 100;
          return (
            <div className="space-y-1 min-w-[180px]">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">Progreso</span>
                <span className="text-xs text-muted-foreground">
                  {percentage}%
                </span>
              </div>
              <Progress
                value={percentage}
                className="h-2"
                indicatorClassName={getProgressColor(percentage)}
              />
            </div>
          );
        },
      },
      {
        accessorKey: "objectivesPercentage",
        header: "Objetivos",
        cell: ({ row }) => {
          if (!row.original.hasObjectives) {
            return <span className="text-xs text-muted-foreground">N/A</span>;
          }
          const percentage = row.original.objectivesPercentage;
          return (
            <div className="space-y-1 min-w-[180px]">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">Objetivos</span>
                <span className="text-xs text-muted-foreground">
                  {percentage.toFixed(0)}%
                </span>
              </div>
              <Progress
                value={percentage}
                className="h-2"
                indicatorClassName={getProgressColor(percentage)}
              />
            </div>
          );
        },
      },
      {
        accessorKey: "result",
        header: "Resultado",
        cell: ({ row }) => (
          <div className="text-center">
            <span className="text-sm font-semibold">
              {row.original.result ? row.original.result.toFixed(1) : "0.0"}
            </span>
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div
            className="cursor-pointer"
            onClick={() => {
              router(
                `/gp/gestion-humana/evaluaciones-de-desempeno/evaluaciones/detalles/${row.original.evaluation_id}/${row.original.person_id}`
              );
            }}
          >
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </div>
        ),
        enableSorting: false,
      },
    ],
    [router]
  );

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-2">Error al cargar los datos</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-4">
      <div className="text-sm text-muted-foreground">
        {data.length} persona{data.length !== 1 ? "s" : ""} encontrada
        {data.length !== 1 ? "s" : ""}
      </div>
      <div className="max-h-[600px] overflow-y-auto">
        <DataTable
          columns={columns}
          data={data}
          isLoading={isLoading}
          variant="outline"
          isVisibleColumnFilter={false}
          className="block w-full"
        />
      </div>
    </div>
  );
};

export default PersonResultsAccordion;
