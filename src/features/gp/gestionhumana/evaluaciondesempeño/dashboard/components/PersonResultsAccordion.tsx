import React from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ExternalLink } from "lucide-react";
import { EvaluationPersonResultResource } from "../../evaluation-person/lib/evaluationPerson.interface";
import FormSkeleton from "@/shared/components/FormSkeleton";

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

  const handlePersonClick = (personResult: EvaluationPersonResultResource) => {
    router(
      `/gp/gestion-humana/evaluaciones-de-desempeno/evaluaciones/detalles/${personResult.evaluation_id}/${personResult.person_id}`
    );
  };

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

  const renderPersonCard = (personResult: EvaluationPersonResultResource) => (
    <div
      key={personResult.id}
      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white"
      onClick={() => handlePersonClick(personResult)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="font-semibold text-sm">
              {personResult.person.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {personResult.person.position || "Sin cargo"}
            </p>
          </div>
        </div>
        {getStatusBadge(personResult)}
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium">Progreso</span>
            <span className="text-xs text-muted-foreground">
              {Number(personResult.total_progress.completion_rate.toFixed(2)) *
                100}
              %
            </span>
          </div>
          <Progress
            value={
              Number(personResult.total_progress.completion_rate.toFixed(2)) *
              100
            }
            className="h-2"
            indicatorClassName={getProgressColor(
              personResult.total_progress.completion_rate * 100
            )}
          />
        </div>

        {personResult.hasObjectives && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium">Objetivos</span>
              <span className="text-xs text-muted-foreground">
                {personResult.objectivesPercentage.toFixed(0)}%
              </span>
            </div>
            <Progress
              value={personResult.objectivesPercentage}
              className="h-2"
              indicatorClassName={getProgressColor(
                personResult.objectivesPercentage
              )}
            />
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-sm font-medium">Resultado Final</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">
              {personResult.result ? personResult.result.toFixed(1) : "0.0"}
            </span>
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="py-4">
        <FormSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-2">Error al cargar los datos</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No se encontraron personas</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-4">
      <div className="text-sm text-muted-foreground">
        {data.length} persona{data.length !== 1 ? "s" : ""} encontrada
        {data.length !== 1 ? "s" : ""}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
        {data.map(renderPersonCard)}
      </div>
    </div>
  );
};

export default PersonResultsAccordion;
