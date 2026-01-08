import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ExternalLink, Search } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/shared/components/DataTable";
import { EvaluationPersonResultResource } from "../../evaluation-person/lib/evaluationPerson.interface";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  const [searchQuery, setSearchQuery] = useState("");

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

  // Filtrar datos basados en la búsqueda
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase();
    return data.filter(
      (person) =>
        person.person.name.toLowerCase().includes(query) ||
        (person.person.position &&
          person.person.position.toLowerCase().includes(query))
    );
  }, [data, searchQuery]);

  // Render personalizado para mobile cards
  const renderMobileCard = (person: EvaluationPersonResultResource) => {
    const percentage =
      Number(person.total_progress.completion_rate.toFixed(2)) * 100;

    return (
      <Card
        key={person.id}
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() =>
          router(
            `/gp/gestion-humana/evaluaciones-de-desempeno/evaluaciones/detalles/${person.evaluation_id}/${person.person_id}`
          )
        }
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header con nombre y estado */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">{person.person.name}</div>
                <div className="text-xs text-muted-foreground">
                  {person.person.position || "Sin cargo"}
                </div>
              </div>
              {getStatusBadge(person)}
            </div>

            {/* Progreso Total */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">Progreso Total</span>
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

            {/* Objetivos */}
            {person.hasObjectives && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium">Objetivos</span>
                  <span className="text-xs text-muted-foreground">
                    {person.objectivesPercentage.toFixed(0)}%
                  </span>
                </div>
                <Progress
                  value={person.objectivesPercentage}
                  className="h-2"
                  indicatorClassName={getProgressColor(
                    person.objectivesPercentage
                  )}
                />
              </div>
            )}

            {/* Resultado Final */}
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm font-medium">Resultado Final</span>
              <span className="text-sm font-semibold">
                {person.result ? person.result.toFixed(1) : "0.0"}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t px-3 py-2 flex justify-end">
          <Button variant="ghost" size="sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver detalle
          </Button>
        </CardFooter>
      </Card>
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
            Number(row.original.total_progress.completion_rate.toFixed(2)) *
            100;
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="text-sm text-muted-foreground">
          {filteredData.length} persona{filteredData.length !== 1 ? "s" : ""}{" "}
          encontrada{filteredData.length !== 1 ? "s" : ""}
          {searchQuery &&
            ` (filtrado de ${data.length} total${
              data.length !== 1 ? "es" : ""
            })`}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o cargo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      <div className="max-h-[600px] overflow-y-auto">
        <DataTable
          columns={columns}
          data={filteredData}
          isLoading={isLoading}
          variant="outline"
          isVisibleColumnFilter={false}
          mobileCardRender={renderMobileCard}
        />
      </div>
    </div>
  );
};

export default PersonResultsAccordion;
