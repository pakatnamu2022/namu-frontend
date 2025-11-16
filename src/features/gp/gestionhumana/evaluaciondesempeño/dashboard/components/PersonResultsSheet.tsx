import React from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ExternalLink } from "lucide-react";
import GeneralSheet from "@/src/shared/components/GeneralSheet";
import { EvaluationPersonResultResource } from "../../evaluation-person/lib/evaluationPerson.interface";
import FormSkeleton from "@/src/shared/components/FormSkeleton";

export interface PersonResultsSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  data: EvaluationPersonResultResource[];
  isLoading: boolean;
  error?: Error | null;
}

const PersonResultsSheet: React.FC<PersonResultsSheetProps> = ({
  open,
  onClose,
  title,
  data,
  isLoading,
  error,
}) => {
  const router = useRouter();

  const handlePersonClick = (personResult: EvaluationPersonResultResource) => {
    router.push(
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
      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
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

  const renderLoadingSkeleton = () => <FormSkeleton />;

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title={title}
      className="!max-w-xl h-full"
    >
      <div className="space-y-4 h-full">
        {isLoading ? (
          renderLoadingSkeleton()
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-2">Error al cargar los datos</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
        ) : data && data.length > 0 ? (
          <>
            <div className="text-sm text-muted-foreground mb-4">
              {data.length} persona{data.length !== 1 ? "s" : ""} encontrada
              {data.length !== 1 ? "s" : ""}
            </div>
            <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
              {data.map(renderPersonCard)}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No se encontraron personas</p>
          </div>
        )}
      </div>
    </GeneralSheet>
  );
};

export default PersonResultsSheet;
