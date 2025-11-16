"use client";

import { notFound, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { errorToast, successToast } from "@/src/core/core.function";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import { storeCycle } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/ciclos/lib/cycle.actions";
import { CycleSchema } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/ciclos/lib/cycle.schema";
import { CycleForm } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/ciclos/components/CycleForm";
import { format } from "date-fns";
import FormWrapper from "@/src/shared/components/FormWrapper";
import FormSkeleton from "@/src/shared/components/FormSkeleton";
import { useAllParameters } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/parametros/lib/parameter.hook";
import { useAllPeriods } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/periodos/lib/period.hook";

export default function CreateCyclePage() {
  const router = useRouter();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { mutate, isPending } = useMutation({
    mutationFn: storeCycle,
    onSuccess: () => {
      successToast("Ciclo creado exitosamente");
      router.push("./");
    },
    onError: (error: any) => {
      errorToast(
        error.response.data.message ?? "Hubo un error al crear el ciclo"
      );
    },
  });

  const handleSubmit = (data: CycleSchema) => {
    mutate({
      ...data,
      start_date: format(data.start_date, "yyyy-MM-dd"),
      end_date: format(data.end_date, "yyyy-MM-dd"),
      cut_off_date: format(data.cut_off_date, "yyyy-MM-dd"),
      // start_date_objectives: format(data.start_date_objectives, "yyyy-MM-dd"),
      // end_date_objectives: format(data.end_date_objectives, "yyyy-MM-dd"),
    });
  };

  const { data: periods = [], isLoading: isLoadingPeriods } = useAllPeriods();
  const { data: parameters = [], isLoading: isLoadingParameters } =
    useAllParameters({
      type: "objectives",
    });

  const isLoadingAny = isLoadingPeriods || isLoadingParameters;

  if (isLoadingAny) return <FormSkeleton />;

  if (!checkRouteExists("ciclos")) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="create"
        icon={currentView.icon}
      />
      <CycleForm
        defaultValues={{
          name: "",
          // start_date_objectives: new Date(),
          // end_date_objectives: new Date(),
          start_date: new Date(),
          end_date: new Date(),
          period_id: "",
          parameter_id: "",
          typeEvaluation: "0",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
        periods={periods}
        parameters={parameters}
      />
    </FormWrapper>
  );
}
