import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { ExternalLink } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/shared/components/DataTable";
import { EvaluationPersonResultResource } from "../../evaluation-person/lib/evaluationPerson.interface";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getProgressColor,
  getResultRateColorBadge,
} from "../../evaluation-person/lib/evaluationPerson.function";
import { Badge } from "@/components/ui/badge";

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

  // Filtrar datos basados en la búsqueda
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase();
    return data.filter(
      (person) =>
        person.person.name.toLowerCase().includes(query) ||
        (person.person.position &&
          person.person.position.toLowerCase().includes(query)),
    );
  }, [data, searchQuery]);

  // Render personalizado para mobile cards
  const renderMobileCard = (person: EvaluationPersonResultResource) => {
    const percentage =
      Number(person.total_progress.completion_rate.toFixed(2)) * 100;

    return (
      <Card
        key={person.id}
        className="cursor-pointer hover:bg-muted/50 transition-colors p-0 gap-0"
        onClick={() =>
          router(
            `/gp/gestion-humana/evaluaciones-de-desempeno/evaluaciones/detalles/${person.evaluation_id}/${person.person_id}`,
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
            {person.objectivesPercentage > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium">Objetivos</span>
                  <span className="text-xs text-muted-foreground">
                    {person.objectivesResult.toFixed(0)}%
                  </span>
                </div>
                <Progress
                  value={person.objectivesResult}
                  className="h-2"
                  indicatorClassName={getResultRateColorBadge(
                    person.objectivesResult,
                  )}
                />
              </div>
            )}

            {/* Resultado Final */}
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm font-medium">Resultado Final</span>
              <Badge
                color={getResultRateColorBadge(person.result)}
                className="text-sm font-semibold"
              >
                {person.result ? person.result.toFixed(1) : "0.0"}
              </Badge>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t flex justify-end [.border-t]:pt-1 py-1 px-4">
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
        accessorKey: "evaluator.name",
        header: "Lider",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-sm">
              {row.original.evaluator?.name ?? "Sin Evalador"}
            </div>
            <div className="text-xs text-muted-foreground">
              {row.original.evaluator?.position || "Sin cargo"}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "total_progress.completion_rate",
        header: "Progreso Total",
        cell: ({ row }) => {
          const percentage = Number(
            row.original.total_progress.completion_rate.toFixed(2),
          );
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
        accessorKey: "result",
        header: "Resultado",
        cell: ({ row }) => (
          <Badge
            className="text-sm font-semibold"
            color={getResultRateColorBadge(row.original.result)}
          >
            {row.original.result ? row.original.result.toFixed(1) : "0.0"}
          </Badge>
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
                `/gp/gestion-humana/evaluaciones-de-desempeno/evaluaciones/detalles/${row.original.evaluation_id}/${row.original.person_id}`,
              );
            }}
          >
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </div>
        ),
      },
    ],
    [router],
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="text-sm text-muted-foreground">
          {filteredData.length} persona{filteredData.length !== 1 ? "s" : ""}{" "}
          encontrada{filteredData.length !== 1 ? "s" : ""}
          {searchQuery &&
            ` (filtrado de ${data.length} total${
              data.length !== 1 ? "es" : ""
            })`}
        </div>
        <Input
          placeholder="Buscar por nombre o cargo..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-64 h-9"
        />
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
