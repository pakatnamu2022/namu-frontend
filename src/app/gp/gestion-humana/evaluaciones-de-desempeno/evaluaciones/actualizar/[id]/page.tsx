"use client";

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import {
  findEvaluationById,
  updateEvaluation,
} from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/lib/evaluation.actions";
import { EvaluationSchema } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/lib/evaluation.schema";
import { EVALUATION } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/lib/evaluation.constans";
import { EvaluationResource } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/lib/evaluation.interface";
import { EvaluationForm } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/components/EvaluationForm";
import { format, parse } from "date-fns";
import { useAllCycles } from "@/features/gp/gestionhumana/evaluaciondesempeño/ciclos/lib/cycle.hook";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { useAllParameters } from "@/features/gp/gestionhumana/evaluaciondesempeño/parametros/lib/parameter.hook";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";

const { MODEL } = EVALUATION;

export default function UpdateEvaluationPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { data: evaluation, isLoading: loadingEvaluation } = useQuery({
    queryKey: [MODEL.name, id],
    queryFn: () =>
      findEvaluationById(id as string, {
        show_extra: 0,
      }),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: EvaluationSchema) =>
      updateEvaluation(Number(id as string), data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({
        queryKey: [MODEL.name, id],
      });
      router("../");
    },
    onError: () => {
      errorToast(ERROR_MESSAGE(MODEL, "update"));
    },
  });

  const handleSubmit = (data: EvaluationSchema) => {
    mutate({
      ...data,
      start_date: data.start_date
        ? format(data.start_date, "yyyy-MM-dd")
        : undefined,
      end_date: data.end_date ? format(data.end_date, "yyyy-MM-dd") : undefined,
    } as any);
  };

  function mapEvaluationToForm(
    data: EvaluationResource
  ): Partial<EvaluationSchema> {
    return {
      name: data.name,
      start_date: parse(data.start_date, "yyyy-MM-dd", new Date()),
      end_date: parse(data.end_date, "yyyy-MM-dd", new Date()),
      typeEvaluation: data.typeEvaluation.toString() as "0" | "1",
      objectivesPercentage: Number(data.objectivesPercentage),
      competencesPercentage: Number(data.competencesPercentage),
      competence_parameter_id: data.competence_parameter_id.toString(),
      final_parameter_id: data.final_parameter_id.toString(),
      cycle_id: data.cycle_id.toString(),
    };
  }

  const { data: cycles = [], isLoading: isLoadingCycles } = useAllCycles();
  const {
    data: parametersCompetence = [],
    isLoading: isLoadingParametersCompetence,
  } = useAllParameters({
    type: "competences",
  });
  const {
    data: parametersObjective = [],
    isLoading: isLoadingParametersObjective,
  } = useAllParameters({
    type: "objectives",
  });
  const { data: parametersFinal = [], isLoading: isLoadingParametersFinal } =
    useAllParameters({
      type: "final",
    });

  const isLoadingAny =
    loadingEvaluation ||
    !evaluation ||
    isLoadingCycles ||
    isLoadingParametersCompetence ||
    isLoadingParametersObjective ||
    isLoadingParametersFinal;

  if (isLoadingAny) return <FormSkeleton />;
  if (!checkRouteExists("parametros")) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="edit"
        icon={currentView.icon}
      />
      <EvaluationForm
        defaultValues={mapEvaluationToForm(evaluation)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
        cycles={cycles}
        parametersCompetence={parametersCompetence}
        parametersObjective={parametersObjective}
        parametersFinal={parametersFinal}
      />
    </FormWrapper>
  );
}
