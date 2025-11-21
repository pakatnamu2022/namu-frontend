"use client";

import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { storeEvaluation } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/lib/evaluation.actions";
import { EVALUATION } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/lib/evaluation.constans";
import { EvaluationSchema } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/lib/evaluation.schema";
import { EvaluationForm } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/components/EvaluationForm";
import { useAllCycles } from "@/features/gp/gestionhumana/evaluaciondesempeño/ciclos/lib/cycle.hook";
import { format } from "date-fns";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { useAllParameters } from "@/features/gp/gestionhumana/evaluaciondesempeño/parametros/lib/parameter.hook";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";

const { MODEL, ABSOLUTE_ROUTE } = EVALUATION;

export default function AddEvaluationPage() {
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { mutate, isPending } = useMutation({
    mutationFn: storeEvaluation,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      errorToast(
        ERROR_MESSAGE(MODEL, "create", error?.response?.data?.message)
      );
    },
  });

  const { data: cycles, isLoading: isLoadingCycles } = useAllCycles();

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

  const handleSubmit = (data: EvaluationSchema) => {
    mutate({
      ...data,
      start_date: data.start_date
        ? format(data.start_date, "yyyy-MM-dd")
        : undefined,
      end_date: data.end_date ? format(data.end_date, "yyyy-MM-dd") : undefined,
    } as any);
  };

  const isLoadingAny =
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
        mode="create"
        icon={currentView.icon}
      />
      <EvaluationForm
        defaultValues={{
          name: "",
          typeEvaluation: "0",
          objectivesPercentage: 100,
          competencesPercentage: 0,
          competence_parameter_id: "",
          final_parameter_id: "",
          cycle_id: "",
          start_date: new Date(),
          end_date: (() => {
            const date = new Date();
            date.setMonth(date.getMonth() + 1);
            return date;
          })(),
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
        cycles={cycles || []}
        parametersCompetence={parametersCompetence}
        parametersObjective={parametersObjective}
        parametersFinal={parametersFinal}
      />
    </FormWrapper>
  );
}
