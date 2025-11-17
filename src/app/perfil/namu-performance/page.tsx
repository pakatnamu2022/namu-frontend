"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/shared/components/animateTabs";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Target,
  Calendar,
  RefreshCw,
  FileText,
} from "lucide-react";
import { EVALUATION_PERSON } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/lib/evaluationPerson.constans";
import { useEvaluationPersonByPersonAndEvaluation } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/lib/evaluationPerson.hook";
import { useAllEvaluations } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/lib/evaluation.hook";
import {
  updateEvaluationPerson,
  updateEvaluationPersonCompetence,
} from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/lib/evaluationPerson.actions";
import EvaluationSummaryCard from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/EvaluationSummaryCard";
import EvaluationPersonObjectiveTable from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/EvaluationPersonObjetiveTable";
import EvaluationPersonCompetenceTableWithColumns from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/EvaluationPersonCompetenceTable";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import { useQueryClient } from "@tanstack/react-query";
import DevelopmentPlanSheet from "@/app/gp/gestion-humana/evaluaciones-de-desempeno/detalle-plan-desarrollo/components/DevelopmentPlanSheet";

const { QUERY_KEY, MODEL } = EVALUATION_PERSON;

export default function NamuPerformancePage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [selectedEvaluationId, setSelectedEvaluationId] = useState<
    number | undefined
  >();
  const [saving, setSaving] = useState(false);
  const [showDevelopmentPlan, setShowDevelopmentPlan] = useState(false);

  const {
    data: evaluationPersonResult,
    isLoading: isLoadingEvaluationPerson,
    refetch: refetchEvaluationResult,
  } = useEvaluationPersonByPersonAndEvaluation(
    user.partner_id,
    selectedEvaluationId
  );

  const { data: evaluations = [], isLoading: isLoadingEvaluations } =
    useAllEvaluations();

  useEffect(() => {
    // setear la evaluación activa al cargar las evaluaciones
    if (evaluations.length > 0 && !selectedEvaluationId) {
      setSelectedEvaluationId(evaluations[0].id);
    }
  }, [evaluations, selectedEvaluationId]);

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

  if (!user || !user.name) return <FormSkeleton />;

  return (
    <div className="w-full">
      <Card>
        <CardContent className="mx-auto max-w-(--breakpoint-2xl)">
          <CardHeader className="space-y-4">
            {/* Header principal */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
                <AvatarImage src={user.foto_adjunto} alt={user.name} />
                <AvatarFallback className="bg-primary text-white text-sm sm:text-lg">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 w-full sm:w-auto">
                <CardTitle className="text-xl sm:text-2xl capitalize">
                  {user.name.toLowerCase()}
                </CardTitle>
                <CardDescription className="capitalize text-sm sm:text-base">
                  {user.position.toLowerCase()}
                </CardDescription>
                {/* {evaluationPersonResult?.evaluation && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">
                    {evaluationPersonResult.evaluation.typeEvaluationName}
                  </Badge>
                  <Badge variant="secondary">
                    {evaluationPersonResult.evaluation.statusName}
                  </Badge>
                </div>
              )} */}
              </div>
              {quickStats && (
                <div className="w-full sm:w-auto text-left sm:text-right">
                  <div className="text-xl sm:text-2xl font-bold text-primary">
                    {quickStats.overallProgress}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Progreso general
                  </div>
                </div>
              )}
            </div>

            {/* Selector de evaluación y controles */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {isLoadingEvaluations ? (
                <Skeleton className="h-10 w-full sm:w-80" />
              ) : (
                <SearchableSelect
                  options={evaluations.map((evaluation) => ({
                    value: evaluation.id.toString(),
                    label: () => (
                      <span className="flex items-center gap-2">
                        {evaluation.name}{" "}
                        <Badge variant={"tertiary"} className="text-[10px]">
                          {evaluation.period}
                        </Badge>
                      </span>
                    ),
                  }))}
                  onChange={(value: string) => {
                    setSelectedEvaluationId(Number(value));
                  }}
                  value={selectedEvaluationId?.toString() ?? ""}
                  placeholder="Selecciona la Evaluación..."
                  className="w-full sm:w-80!"
                />
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:ml-auto">
                {saving && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center sm:justify-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    Guardando...
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDevelopmentPlan(true)}
                    disabled={!evaluationPersonResult}
                    className="gap-2 w-full sm:w-auto"
                  >
                    <FileText className="size-4" />
                    <span className="hidden sm:inline">Plan de Desarrollo</span>
                    <span className="sm:hidden">Plan</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={saving}
                    className="gap-2 w-full sm:w-auto"
                  >
                    <RefreshCw
                      className={`size-4 ${saving ? "animate-spin" : ""}`}
                    />
                    Actualizar
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>

          <div className="mt-6 space-y-4">
            {/* Resumen de estadísticas */}
            {!isLoadingEvaluationPerson && evaluationPersonResult && (
              <EvaluationSummaryCard
                evaluationResult={evaluationPersonResult}
              />
            )}

            {/* Tabs de contenido */}
            <Tabs
              defaultValue="objectives"
              className="p-2 w-full bg-muted rounded-lg"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="objectives"
                  className="gap-1 sm:gap-2 text-xs sm:text-sm"
                >
                  <Target className="size-3 sm:size-4" />
                  <span className="hidden sm:inline">Objetivos</span>
                  <span className="sm:hidden">Obj.</span>
                  {quickStats && (
                    <Badge
                      variant="outline"
                      className="ml-1 sm:ml-2 text-[10px] sm:text-xs"
                    >
                      {quickStats.objectives.completed}/
                      {quickStats.objectives.total}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="competences"
                  className="gap-1 sm:gap-2 text-xs sm:text-sm"
                >
                  <TrendingUp className="size-3 sm:size-4" />
                  <span className="hidden sm:inline">Competencias</span>
                  <span className="sm:hidden">Comp.</span>
                  {quickStats && (
                    <Badge
                      variant="outline"
                      className="ml-1 sm:ml-2 text-[10px] sm:text-xs"
                    >
                      {quickStats.competences.completed}/
                      {quickStats.competences.total}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
              <TabsContents className="rounded-sm bg-background w-full">
                <TabsContent
                  value="objectives"
                  className="space-y-4 sm:space-y-6 p-3 sm:p-6"
                >
                  {isLoadingEvaluationPerson ? (
                    <FormSkeleton />
                  ) : (
                    <>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <h3 className="text-base sm:text-lg font-semibold">
                          Evaluación de Objetivos
                        </h3>
                        {evaluationPersonResult?.objectivesPercentage && (
                          <Badge variant="outline" className="text-xs">
                            Peso: {evaluationPersonResult.objectivesPercentage}%
                            del total
                          </Badge>
                        )}
                      </div>
                      <EvaluationPersonObjectiveTable
                        readOnly={true}
                        evaluationPersonResult={evaluationPersonResult}
                        details={evaluationPersonResult?.details}
                        onUpdateCell={handleUpdateResultCell}
                      />
                    </>
                  )}
                </TabsContent>
                <TabsContent
                  value="competences"
                  className="space-y-4 sm:space-y-6 p-3 sm:p-6"
                >
                  {isLoadingEvaluationPerson ? (
                    <FormSkeleton />
                  ) : (
                    <>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <h3 className="text-base sm:text-lg font-semibold">
                          Evaluación de Competencias
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                          {evaluationPersonResult?.competencesPercentage && (
                            <Badge variant="outline" className="text-xs">
                              Peso:{" "}
                              {evaluationPersonResult.competencesPercentage}%
                              del total
                            </Badge>
                          )}
                          {evaluationPersonResult?.evaluation
                            ?.typeEvaluationName && (
                            <Badge variant="secondary" className="text-xs">
                              {
                                evaluationPersonResult.evaluation
                                  .typeEvaluationName
                              }
                            </Badge>
                          )}
                        </div>
                      </div>
                      <EvaluationPersonCompetenceTableWithColumns
                        evaluationPersonResult={evaluationPersonResult}
                        competenceGroups={
                          evaluationPersonResult?.competenceGroups
                        }
                        onUpdateCell={handleUpdateResultCellCompetence}
                        readOnly={true}
                        showProgress={true}
                      />
                    </>
                  )}
                </TabsContent>
              </TabsContents>
            </Tabs>

            {/* Footer con acciones */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 pt-4 border-t">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                {evaluationPersonResult?.evaluation && (
                  <>
                    <div className="flex items-center gap-2">
                      <Calendar className="size-3 sm:size-4" />
                      <span className="text-xs sm:text-sm">
                        {new Date(
                          evaluationPersonResult.evaluation.start_date
                        ).toLocaleDateString("es-ES", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        -{" "}
                        {new Date(
                          evaluationPersonResult.evaluation.end_date
                        ).toLocaleDateString("es-ES", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px] sm:text-xs">
                      {evaluationPersonResult.evaluation.period}
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sheet para ver/editar plan de desarrollo */}
      {evaluationPersonResult && (
        <DevelopmentPlanSheet
          open={showDevelopmentPlan}
          onClose={() => setShowDevelopmentPlan(false)}
          evaluationId={evaluationPersonResult.evaluation.id}
          workerId={user.partner_id}
          bossId={0}
        />
      )}
    </div>
  );
}
