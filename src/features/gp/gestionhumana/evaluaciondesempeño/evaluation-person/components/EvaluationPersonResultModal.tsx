"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/shared/components/animateTabs";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { useEvaluationPersonByPersonAndEvaluation } from "../lib/evaluationPerson.hook";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAllEvaluations } from "../../evaluaciones/lib/evaluation.hook";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkerResource } from "../../../personal/trabajadores/lib/worker.interface";
import {
  updateEvaluationPerson,
  updateEvaluationPersonCompetence,
} from "../lib/evaluationPerson.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { EVALUATION_PERSON } from "../lib/evaluationPerson.constans";
import EvaluationPersonObjetiveTable from "./EvaluationPersonObjetiveTable";
import EvaluationPersonCompetenceTable from "./EvaluationPersonCompetenceTable";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, Calendar, RefreshCw } from "lucide-react";
import EvaluationSummaryCard from "./EvaluationSummaryCard";
import { EVALUATION_OBJECTIVE } from "../../evaluaciones/lib/evaluation.constans";

interface Props {
  queryClient: any;
  open: boolean;
  setOpen: (open: boolean) => void;
  person: WorkerResource;
  evaluation_id: number;
}

const { QUERY_KEY, MODEL } = EVALUATION_PERSON;

export function EvaluationPersonResultModal({
  queryClient,
  open,
  setOpen,
  person,
  evaluation_id,
}: Props) {
  const [selectedEvaluationId, setSelectedEvaluationId] =
    useState<number>(evaluation_id);
  const [saving, setSaving] = useState(false);

  const {
    data: evaluationPersonResult,
    isLoading: isLoadingEvaluationPerson,
    refetch: refetchEvaluationResult,
  } = useEvaluationPersonByPersonAndEvaluation(person.id, selectedEvaluationId);

  const { data: evaluations = [], isLoading: isLoadingEvaluations } =
    useAllEvaluations();

  const invalidateQuery = async () => {
    await queryClient.invalidateQueries({
      queryKey: [QUERY_KEY],
    });
  };

  const handleUpdateResultCell = async (id: number, result: number) => {
    try {
      setSaving(true);
      await updateEvaluationPerson(id, { result });
      await Promise.all([invalidateQuery(), refetchEvaluationResult()]);
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message || ERROR_MESSAGE(MODEL, "update")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCommentSubmit = async (id: number, comment: string) => {
    try {
      setSaving(true);
      await updateEvaluationPerson(id, { comment });
      await Promise.all([invalidateQuery(), refetchEvaluationResult()]);
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message || ERROR_MESSAGE(MODEL, "update")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateResultCellCompetence = async (
    id: number,
    result: number
  ) => {
    try {
      setSaving(true);
      await updateEvaluationPersonCompetence(id, { result });
      await Promise.all([invalidateQuery(), refetchEvaluationResult()]);
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message || ERROR_MESSAGE(MODEL, "update")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setSaving(true);
      await refetchEvaluationResult();
      successToast("Datos actualizados correctamente");
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message || "Error al actualizar los datos"
      );
    } finally {
      setSaving(false);
    }
  };

  // Calcular estadísticas rápidas
  const getQuickStats = () => {
    if (!evaluationPersonResult) return null;

    const totalCompetences =
      evaluationPersonResult.competenceGroups?.reduce(
        (sum, group) => sum + group.total_sub_competences,
        0
      ) || 0;
    const completedCompetences =
      evaluationPersonResult.competenceGroups?.reduce(
        (sum, group) => sum + group.completed_evaluations,
        0
      ) || 0;
    const totalObjectives = evaluationPersonResult.details?.length || 0;
    const completedObjectives =
      evaluationPersonResult.details?.filter(
        (detail) => parseFloat(detail.result) > 0
      ).length || 0;

    return {
      competences: { completed: completedCompetences, total: totalCompetences },
      objectives: { completed: completedObjectives, total: totalObjectives },
      overallProgress:
        Math.round(
          ((completedCompetences + completedObjectives) /
            (totalCompetences + totalObjectives)) *
            100
        ) || 0,
    };
  };

  const quickStats = getQuickStats();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="sm:max-w-6xl overflow-auto">
        <SheetHeader className="space-y-4">
          {/* Header principal */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={person.photo} alt={person.name} />
              <AvatarFallback className="bg-primary text-white text-lg">
                {person.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <SheetTitle className="text-2xl capitalize">
                {person.name.toLowerCase()}
              </SheetTitle>
              <SheetDescription className="capitalize text-base">
                {person.position.toLowerCase()}
              </SheetDescription>
            </div>
            {quickStats && (
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {quickStats.overallProgress}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Progreso general
                </div>
              </div>
            )}
          </div>

          {/* Selector de evaluación y controles */}
          <div className="flex items-center justify-between gap-4">
            {isLoadingEvaluations ? (
              <Skeleton className="h-8 w-80" />
            ) : (
              <SearchableSelect
                options={evaluations.map((evaluation) => ({
                  value: evaluation.id.toString(),
                  label: () => (
                    <span>
                      {evaluation.name} <Badge>{evaluation.period}</Badge>
                    </span>
                  ),
                }))}
                onChange={(value: string) => {
                  setSelectedEvaluationId(Number(value));
                }}
                value={selectedEvaluationId.toString()}
                placeholder="Selecciona la Evaluación..."
                className="!w-80"
              />
            )}

            <div className="flex items-center gap-2">
              {saving && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  Guardando...
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={saving}
                className="gap-2"
              >
                <RefreshCw
                  className={`size-4 ${saving ? "animate-spin" : ""}`}
                />
                Actualizar
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Resumen de estadísticas */}
          {!isLoadingEvaluationPerson && evaluationPersonResult && (
            <EvaluationSummaryCard evaluationResult={evaluationPersonResult} />
          )}
          {/* Tabs de contenido */}
          <Tabs
            defaultValue="objectives"
            className="p-2 w-full bg-muted rounded-lg"
          >
            <TabsList className="grid w-full grid-cols-2">
              {evaluationPersonResult?.hasObjectives && (
                <TabsTrigger value="objectives" className="gap-2">
                  <Target className="size-4" />
                  Objetivos
                  {quickStats && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {quickStats.objectives.completed}/
                      {quickStats.objectives.total}
                    </Badge>
                  )}
                </TabsTrigger>
              )}
              {evaluationPersonResult?.evaluation.typeEvaluation.toString() !==
                EVALUATION_OBJECTIVE.ID && (
                <TabsTrigger value="competences" className="gap-2">
                  <TrendingUp className="size-4" />
                  Competencias
                  {quickStats && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {quickStats.competences.completed}/
                      {quickStats.competences.total}
                    </Badge>
                  )}
                </TabsTrigger>
              )}
            </TabsList>
            <TabsContents className="rounded-sm h-full bg-background w-full overflow-y-auto">
              <TabsContent value="objectives" className="space-y-6 p-6">
                {isLoadingEvaluationPerson ? (
                  <FormSkeleton />
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        Evaluación de Objetivos
                      </h3>
                      {evaluationPersonResult?.objectivesPercentage && (
                        <Badge variant="outline">
                          Peso: {evaluationPersonResult.objectivesPercentage}%
                          del total
                        </Badge>
                      )}
                    </div>
                    <EvaluationPersonObjetiveTable
                      evaluationPersonResult={evaluationPersonResult}
                      details={evaluationPersonResult?.details}
                      onUpdateCell={handleUpdateResultCell}
                      onCommentCell={handleCommentSubmit}
                    />
                  </>
                )}
              </TabsContent>
              <TabsContent value="competences" className="space-y-6 p-6">
                {isLoadingEvaluationPerson ? (
                  <FormSkeleton />
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        Evaluación de Competencias
                      </h3>
                      <div className="flex items-center gap-2">
                        {evaluationPersonResult?.competencesPercentage && (
                          <Badge variant="outline">
                            Peso: {evaluationPersonResult.competencesPercentage}
                            % del total
                          </Badge>
                        )}
                        {evaluationPersonResult?.evaluation
                          ?.typeEvaluationName && (
                          <Badge variant="secondary">
                            {
                              evaluationPersonResult.evaluation
                                .typeEvaluationName
                            }
                          </Badge>
                        )}
                      </div>
                    </div>
                    <EvaluationPersonCompetenceTable
                      evaluationPersonResult={evaluationPersonResult}
                      competenceGroups={
                        evaluationPersonResult?.competenceGroups
                      }
                      onUpdateCell={handleUpdateResultCellCompetence}
                      readOnly={false}
                      showProgress={true}
                    />
                  </>
                )}
              </TabsContent>
            </TabsContents>
          </Tabs>

          {/* Footer con acciones */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {evaluationPersonResult?.evaluation && (
                <>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4" />
                    <span>
                      {new Date(
                        evaluationPersonResult.evaluation.start_date
                      ).toLocaleDateString("es-ES")}{" "}
                      -
                      {new Date(
                        evaluationPersonResult.evaluation.end_date
                      ).toLocaleDateString("es-ES")}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {evaluationPersonResult.evaluation.period}
                  </Badge>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="default" onClick={() => setOpen(false)}>
                Guardar y Cerrar
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
