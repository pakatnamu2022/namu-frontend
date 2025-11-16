import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EvaluationResource } from "../../evaluaciones/lib/evaluation.interface";
import { CalendarDays } from "lucide-react";

// Componente de Información de Evaluación
interface EvaluationInfoProps {
  evaluationData: EvaluationResource;
}

export const EvaluationInfo: React.FC<EvaluationInfoProps> = ({
  evaluationData,
}) => {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("es-ES");
  };

  const calculateDuration = (startDate: string, endDate: string): number => {
    return Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          {evaluationData.name} - {evaluationData.typeEvaluationName}
        </CardTitle>
        <CardDescription>
          Período: {evaluationData.period} | Ciclo: {evaluationData.cycle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Fecha de Inicio</p>
            <p className="text-lg font-medium">
              {formatDate(evaluationData.start_date)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Fecha de Fin</p>
            <p className="text-lg font-medium">
              {formatDate(evaluationData.end_date)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Duración</p>
            <p className="text-lg font-medium">
              {calculateDuration(
                evaluationData.start_date,
                evaluationData.end_date
              )}{" "}
              días
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
