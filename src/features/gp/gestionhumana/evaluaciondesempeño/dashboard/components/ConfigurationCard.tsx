import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  EvaluationResource,
  ProgressStats,
} from "../../evaluaciones/lib/evaluation.interface";
import { Badge } from "@/components/ui/badge";

// Componente de Configuración
interface ConfigurationCardProps {
  evaluationData: EvaluationResource;
  progressStats: ProgressStats;
}

export const ConfigurationCard: React.FC<ConfigurationCardProps> = ({
  evaluationData,
  progressStats,
}) => {
  const completionPercentage: number =
    (progressStats.completed_participants / progressStats.total_participants) *
    100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Evaluación</CardTitle>
        <CardDescription>Parámetros y distribución</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-3">Distribución de Peso</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Objetivos</span>
              <Badge variant="default">
                {evaluationData.objectivesPercentage}%
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Competencias</span>
              <Badge variant="secondary">
                {evaluationData.competencesPercentage}%
              </Badge>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Métricas de Progreso</h4>
          <div className="space-y-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <p className="text-2xl font-medium text-primary">
                {completionPercentage.toFixed(1)}%
              </p>
              <p className="text-sm text-primary">Completitud</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-muted-foreground/10 rounded-lg">
                <p className="text-lg font-medium text-muted-foreground">
                  {progressStats.in_progress_participants}
                </p>
                <p className="text-xs text-muted-foreground">En progreso</p>
              </div>
              <div className="p-3 bg-secondary/20 rounded-lg">
                <p className="text-lg font-medium text-secondary">
                  {progressStats.not_started_participants}
                </p>
                <p className="text-xs text-secondary">Pendientes</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
