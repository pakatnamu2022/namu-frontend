import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Target,
  CheckCircle2,
  ChartBarIncreasing,
} from "lucide-react";
import { EvaluationPersonResultResource } from "../lib/evaluationPerson.interface";
import { cn } from "@/lib/utils";
import { getScales } from "../../parametros/lib/parameter.hook";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { useState } from "react";
import { ParameterResource } from "../../parametros/lib/parameter.interface";
import ParameterInfo from "../../parametros/components/ParameterInfo";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface Props {
  evaluationResult?: EvaluationPersonResultResource;
}

interface MetricCardProps {
  icon: LucideIcon;
  title: string;
  score: number;
  maxScore: number;
  labelRange: string;
  percentage?: number;
  parameter: ParameterResource;
  indexRange: number;
  isFinal?: boolean;
  completed?: number;
  total?: number;
  completionRate?: number;
}

function ModalParameter({ parameter }: { parameter: ParameterResource }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="icon" className="h-6 w-6 p-0" onClick={() => setOpen(true)}>
        <ChartBarIncreasing className="h-4 w-4" />
      </Button>
      <GeneralModal
        title="Rangos de Parámetro"
        open={open}
        onClose={() => setOpen(false)}
      >
        <ParameterInfo parameter={parameter} info={true} />
      </GeneralModal>
    </>
  );
}

function MetricCard({
  icon: Icon,
  title,
  score,
  maxScore,
  labelRange,
  percentage,
  parameter,
  indexRange,
  isFinal,
  completed,
  total,
  completionRate,
}: MetricCardProps) {
  const scaleClass = getScales(parameter.details.length)[indexRange];

  if (isFinal) {
    return (
      <div className="p-4 bg-primary/5 border rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className="size-5 text-primary" />
            <span className="text-sm font-semibold">{title}</span>
          </div>
          <ModalParameter parameter={parameter} />
        </div>

        <div className="flex items-center justify-center gap-2">
          <Badge
            variant="ghost"
            className={cn("text-2xl font-bold px-4 py-2", scaleClass)}
          >
            {score}/{maxScore}%
          </Badge>
          <Badge
            variant="ghost"
            className={cn("text-lg font-semibold px-3 py-1", scaleClass)}
          >
            {labelRange}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-muted/30 rounded-lg space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="size-5 text-muted-foreground" />
          <span className="text-sm font-semibold">{title}</span>
        </div>
        <ModalParameter parameter={parameter} />
      </div>

      {/* Score y Nivel */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Puntuación</div>
          <Badge
            variant="ghost"
            className={cn("text-base font-bold", scaleClass)}
          >
            {score}/{maxScore}
          </Badge>
        </div>
        <div className="space-y-1 text-right">
          <div className="text-xs text-muted-foreground">Nivel</div>
          <Badge
            variant="ghost"
            className={cn("text-sm font-semibold", scaleClass)}
          >
            {labelRange}
          </Badge>
        </div>
      </div>

      {/* Progreso */}
      <div className="pt-2 border-t space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Completados</span>
          <span className="font-medium">
            {completed}/{total}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Peso en evaluación</span>
          <span className="font-medium text-primary">{percentage}%</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Tasa de finalización</span>
          <Badge variant="outline" className="text-xs h-5">
            {completionRate}%
          </Badge>
        </div>
      </div>
    </div>
  );
}

export default function EvaluationSummaryCard({ evaluationResult }: Props) {
  if (!evaluationResult) {
    return null;
  }

  const competenceMaxScore = evaluationResult.statistics.competences.max_score;

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            icon={CheckCircle2}
            title="Objetivos"
            score={evaluationResult.objectivesResult}
            maxScore={evaluationResult.statistics.objectives.max_score}
            labelRange={evaluationResult.statistics.objectives.label_range}
            percentage={evaluationResult.objectivesPercentage}
            parameter={evaluationResult.objectiveParameter}
            indexRange={
              evaluationResult.statistics.objectives.index_range_result
            }
            completed={evaluationResult.statistics.objectives.completed}
            total={evaluationResult.statistics.objectives.total}
            completionRate={
              evaluationResult.statistics.objectives.completion_rate
            }
          />

          <MetricCard
            icon={Target}
            title="Competencias"
            score={evaluationResult.statistics.competences.average_score}
            maxScore={competenceMaxScore}
            labelRange={evaluationResult.statistics.competences.label_range}
            percentage={evaluationResult.competencesPercentage}
            parameter={evaluationResult.competenceParameter}
            indexRange={
              evaluationResult.statistics.competences.index_range_result
            }
            completed={evaluationResult.statistics.competences.completed}
            total={evaluationResult.statistics.competences.total}
            completionRate={
              evaluationResult.statistics.competences.completion_rate
            }
          />

          <MetricCard
            icon={TrendingUp}
            title="Resultado Final"
            score={evaluationResult.result}
            maxScore={evaluationResult.maxFinalParameter}
            labelRange={evaluationResult.statistics.final.label_range}
            parameter={evaluationResult.finalParameter}
            indexRange={evaluationResult.statistics.final.index_range_result}
            isFinal
          />
        </div>

        {evaluationResult.evaluation && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <Badge variant="outline">
                  {evaluationResult.evaluation.typeEvaluationName}
                </Badge>
                <span className="text-muted-foreground">
                  {evaluationResult.evaluation.period} -{" "}
                  {evaluationResult.evaluation.cycle}
                </span>
              </div>
              <Badge
                variant={
                  evaluationResult.evaluation.status === 2
                    ? "secondary"
                    : evaluationResult.evaluation.status === 1
                    ? "default"
                    : "tertiary"
                }
              >
                {evaluationResult.evaluation.statusName}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
