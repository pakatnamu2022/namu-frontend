import React from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  Calendar,
  BarChart3,
  Activity,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EvaluationResource } from "../../evaluaciones/lib/evaluation.interface";
import { parse } from "date-fns";
import { Link } from "react-router-dom";
import { EVALUATION_PERSON } from "../../evaluation-person/lib/evaluationPerson.constans";
import TitleComponent from "@/shared/components/TitleComponent";

interface EvaluationHeaderProps {
  evaluationData: EvaluationResource;
  refetching: boolean;
  onRefresh: () => void;
  onDownloadReport: () => void;
}

const { ABSOLUTE_ROUTE } = EVALUATION_PERSON;

export const EvaluationHeader: React.FC<EvaluationHeaderProps> = ({
  evaluationData,
  refetching,
  onRefresh,
  onDownloadReport,
}) => {
  const getStatusVariant = (
    status: number
  ): "default" | "secondary" | "outline" | "tertiary" => {
    switch (status) {
      case 0:
        return "tertiary";
      case 1:
        return "default";
      case 2:
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: number): React.ReactElement => {
    switch (status) {
      case 1:
        return <Clock className="h-3.5 w-3.5" />;
      case 2:
        return <CheckCircle2 className="h-3.5 w-3.5" />;
      case 3:
        return <AlertCircle className="h-3.5 w-3.5" />;
      default:
        return <Activity className="h-3.5 w-3.5" />;
    }
  };

  const formatDate = (dateString: string): string => {
    return parse(dateString, "yyyy-MM-dd", new Date()).toLocaleDateString(
      "es-ES",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatDateLong = (dateString: string): string => {
    return parse(dateString, "yyyy-MM-dd", new Date()).toLocaleDateString(
      "es-ES",
      { weekday: "long" }
    );
  };

  const calculateDurationDays = (
    startDateString: string,
    endDateString: string
  ): number => {
    const startDate = parse(startDateString, "yyyy-MM-dd", new Date());
    const endDate = parse(endDateString, "yyyy-MM-dd", new Date());
    const durationMs = endDate.getTime() - startDate.getTime();
    return Math.ceil(durationMs / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir ambos días
  };

  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Información Principal */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <TitleComponent
              title={evaluationData.name}
              subtitle={`${evaluationData.typeEvaluationName} • ${evaluationData.period}`}
              icon="BarChart3"
              isTruncate={false}
            />
            <Badge variant={getStatusVariant(evaluationData.status)} size="sm">
              {getStatusIcon(evaluationData.status)}
              <span className="ml-2">{evaluationData.statusName}</span>
            </Badge>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="tertiary"
            size="sm"
            onClick={onRefresh}
            disabled={refetching}
            className="gap-2"
          >
            <RefreshCw
              className={`size-4 ${refetching ? "animate-spin" : ""}`}
            />
            Actualizar
          </Button>
          <Link to={`${ABSOLUTE_ROUTE}/${evaluationData.id}`}>
            <Button variant="outline" size="sm" className="order-2 sm:order-1">
              <Activity className="h-4 w-4 mr-2" />
              Ver Evaluaciones
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={onDownloadReport}
            className="order-1 sm:order-2"
          >
            <Download className="h-4 w-4 mr-2" />
            Descargar Reporte
          </Button>
        </div>
      </div>

      {/* Información de Fechas Mejorada */}
      <Card className="">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Título de Fechas */}
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                Cronograma de Evaluación
              </h3>
            </div>

            {/* Timeline de Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Fecha de Inicio */}
              <div className="relative">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                  <div className="shrink-0 w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary dark:text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary dark:text-primary-foreground">
                      Fecha de Inicio
                    </p>
                    <p className="text-lg font-bold text-primary dark:text-primary-foreground">
                      {formatDate(evaluationData.start_date)}
                    </p>
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                      {formatDateLong(evaluationData.start_date)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Duración */}
              <div className="relative">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                  <div className="shrink-0 w-10 h-10 bg-muted/40 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Duración
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      {calculateDurationDays(
                        evaluationData.start_date,
                        evaluationData.end_date
                      )}{" "}
                      días
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Período de evaluación
                    </p>
                  </div>
                </div>
              </div>

              {/* Fecha de Fin */}
              <div className="relative">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/5 hover:bg-secondary/10 transition-colors">
                  <div className="shrink-0 w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-secondary dark:text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-secondary dark:text-secondary-foreground">
                      Fecha de Fin
                    </p>
                    <p className="text-lg font-bold text-secondary dark:text-secondary-foreground">
                      {formatDate(evaluationData.end_date)}
                    </p>
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                      {formatDateLong(evaluationData.end_date)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Información Adicional */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-muted/30">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Ciclo:</span>
                  <Badge variant="outline" className="text-xs font-medium">
                    {evaluationData.cycle}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Período:</span>
                  <span className="font-medium text-foreground">
                    {evaluationData.period}
                  </span>
                </div>
              </div>

              {/* Tiempo restante o estado */}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-primary">
                  {evaluationData.statusName}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
