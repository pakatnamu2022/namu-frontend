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
import { EVALUATION_OBJECTIVE } from "../../evaluaciones/lib/evaluation.constans";

interface Props {
  evaluationResult?: EvaluationPersonResultResource;
}

export function ModalParameter({
  parameter,
}: {
  parameter: ParameterResource;
}) {
  const [openFinalParameterModal, setOpenFinalParameterModal] = useState(false);
  return (
    <>
      <Button
        size={"icon"}
        className="h-6 w-6 p-0"
        onClick={() => setOpenFinalParameterModal(true)}
      >
        <ChartBarIncreasing className="h-4 w-4" />
      </Button>

      <GeneralModal
        title={`Rangos de Parámetro`}
        open={openFinalParameterModal}
        onClose={() => setOpenFinalParameterModal(false)}
      >
        <ParameterInfo parameter={parameter} info={true} />
      </GeneralModal>
    </>
  );
}

export default function EvaluationSummaryCard({ evaluationResult }: Props) {
  if (!evaluationResult) {
    return null;
  }

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Resultado Final */}
          <div className="text-center p-3 bg-primary/5 rounded-lg border">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp className="size-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">
                Resultado Final
              </span>
              <ModalParameter parameter={evaluationResult.finalParameter} />
            </div>
            <div className="flex items-center justify-center gap-1">
              <Badge
                variant={"ghost"}
                className={cn(
                  "text-lg font-bold",
                  getScales(evaluationResult.finalParameter.details.length)[
                    evaluationResult.statistics.final.index_range_result
                  ]
                )}
              >
                {evaluationResult.result}/{evaluationResult.maxFinalParameter}%
              </Badge>

              <Badge
                variant={"ghost"}
                className={cn(
                  "text-lg font-bold",
                  getScales(evaluationResult.finalParameter.details.length)[
                    evaluationResult.statistics.final.index_range_result
                  ]
                )}
              >
                {evaluationResult.statistics.final.label_range}
              </Badge>
            </div>
          </div>

          {/* Objetivos */}
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CheckCircle2 className="size-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Objetivos
              </span>
              <ModalParameter parameter={evaluationResult.objectiveParameter} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Badge
                  variant={"ghost"}
                  className={cn(
                    getScales(
                      evaluationResult.objectiveParameter.details.length
                    )[evaluationResult.statistics.objectives.index_range_result]
                  )}
                >
                  {evaluationResult.objectivesResult}/
                  {evaluationResult.statistics.objectives.max_score}%
                </Badge>
                <Badge
                  variant={"ghost"}
                  className={cn(
                    getScales(
                      evaluationResult.objectiveParameter.details.length
                    )[evaluationResult.statistics.objectives.index_range_result]
                  )}
                >
                  {evaluationResult.statistics.objectives.label_range}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                ({evaluationResult.objectivesPercentage}% del total)
              </div>
            </div>
          </div>

          {/* Competencias */}
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Target className="size-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Competencias
              </span>
              <ModalParameter
                parameter={evaluationResult.competenceParameter}
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Badge
                  variant={"ghost"}
                  className={cn(
                    getScales(
                      evaluationResult.competenceParameter.details.length
                    )[
                      evaluationResult.statistics.competences.index_range_result
                    ]
                  )}
                >
                  {evaluationResult.competencesResult}/
                  {evaluationResult.evaluation.typeEvaluation ===
                  Number(EVALUATION_OBJECTIVE.ID)
                    ? 0
                    : 100}{" "}
                  %
                </Badge>
                <Badge
                  variant={"ghost"}
                  className={cn(
                    getScales(
                      evaluationResult.competenceParameter.details.length
                    )[
                      evaluationResult.statistics.competences.index_range_result
                    ]
                  )}
                >
                  {evaluationResult.statistics.competences.label_range}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                ({evaluationResult.competencesPercentage}% del total)
              </div>
            </div>
          </div>

          {/* Progreso General */}
          {/* <div className="text-center p-3 bg-accent rounded-lg border border-primary/40">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar className="size-4 text-primary" />
              <span className="text-xs font-medium text-primary">
                Progreso General
              </span>
            </div>
            <div className="space-y-2">
              <div className="text-xl font-bold text-primary">
                {evaluationResult.statistics.overall_completion_rate}%
              </div>
              <Progress
                value={evaluationResult.statistics.overall_completion_rate}
                className="w-full h-2"
              />
            </div>
          </div> */}
        </div>

        {/* Detalles de progreso */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center justify-between p-2 bg-muted/20 rounded">
            <span className="text-muted-foreground">
              Competencias completadas:
            </span>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {evaluationResult.statistics.competences.completed}/
                {evaluationResult.statistics.competences.total}
              </span>
              <Badge variant="outline" className="text-xs">
                {evaluationResult.statistics.competences.completion_rate}%
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 bg-muted/20 rounded">
            <span className="text-muted-foreground">
              Objetivos completados:
            </span>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {evaluationResult.statistics.objectives.completed}/
                {evaluationResult.statistics.objectives.total}
              </span>
              <Badge variant="outline" className="text-xs">
                {evaluationResult.statistics.objectives.completion_rate}%
              </Badge>
            </div>
          </div>
        </div>

        {/* Información de la evaluación */}
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
