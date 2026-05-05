import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Target,
  CheckCircle2,
  ChartBarIncreasing,
  RefreshCw,
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
  onRefresh: () => void;
  isSaving: boolean;
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
      <div className="p-4 bg-muted/30 border rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className="size-5 text-primary" />
            <span className="text-sm font-semibold">{title}</span>
          </div>
          <ModalParameter parameter={parameter} />
        </div>

        <div className="flex items-end justify-center gap-2 flex-wrap">
          <Badge
            size="lg"
            variant="ghost"
            className={cn("text-xl font-bold", scaleClass)}
          >
            {score}/{maxScore}%
          </Badge>
          <Badge
            size="sm"
            variant="ghost"
            className={cn("text-sm font-semibold", scaleClass)}
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
      <div className="flex items-end gap-2 flex-wrap justify-between">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Puntuación</div>
          <Badge
            size="lg"
            variant="ghost"
            className={cn("text-base font-bold", scaleClass)}
          >
            {score}/{maxScore}
          </Badge>
        </div>
        <div className="space-y-1 text-right">
          <div className="text-xs text-muted-foreground">Nivel</div>
          <Badge
            size="sm"
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
          <Badge variant="outline" size="sm" className="text-xs h-5">
            {completionRate}%
          </Badge>
        </div>
      </div>
    </div>
  );
}

export default function EvaluationSummaryCard({
  evaluationResult,
  onRefresh,
  isSaving,
}: Props) {
  if (!evaluationResult) {
    return null;
  }

  const competenceMaxScore = evaluationResult.statistics.competences.max_score;

  return (
    <div className="flex flex-col w-full gap-2">
      <div className="flex items-center gap-2 justify-end w-full">
        <Button
          size="icon-lg"
          color="primary"
          onClick={onRefresh}
          disabled={isSaving}
          className="gap-2"
        >
          <RefreshCw className={`size-4 ${isSaving ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 h-fit w-full row-start-1 md:row-start-auto col-span-3 md:col-span-1">
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

        {evaluationResult.objectivesPercentage > 0 && (
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
        )}

        {evaluationResult.competencesPercentage > 0 && (
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
        )}
      </div>
    </div>
  );
}
