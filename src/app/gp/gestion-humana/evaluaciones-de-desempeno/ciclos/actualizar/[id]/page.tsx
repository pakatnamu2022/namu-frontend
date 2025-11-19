"use client";

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { errorToast, successToast } from "@/core/core.function";
import {
  findCycleById,
  updateCycle,
} from "@/features/gp/gestionhumana/evaluaciondesempeño/ciclos/lib/cycle.actions";
import { CycleSchema } from "@/features/gp/gestionhumana/evaluaciondesempeño/ciclos/lib/cycle.schema";
import { CycleResource } from "@/features/gp/gestionhumana/evaluaciondesempeño/ciclos/lib/cycle.interface";
import { CycleForm } from "@/features/gp/gestionhumana/evaluaciondesempeño/ciclos/components/CycleForm";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { format, parse } from "date-fns";
import FormSkeleton from "@/shared/components/FormSkeleton";
import FormWrapper from "@/shared/components/FormWrapper";
import { useAllPeriods } from "@/features/gp/gestionhumana/evaluaciondesempeño/periodos/lib/period.hook";
import { useAllParameters } from "@/features/gp/gestionhumana/evaluaciondesempeño/parametros/lib/parameter.hook";
import { notFound } from "@/shared/hooks/useNotFound";
import { CYCLE } from "@/features/gp/gestionhumana/evaluaciondesempeño/ciclos/lib/cycle.constants";

export default function UpdateCyclePage() {
  const { ABSOLUTE_ROUTE } = CYCLE;
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { data: cycle, isLoading: loadingCycle } = useQuery({
    queryKey: ["cycle", id],
    queryFn: () => findCycleById(id as string),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CycleSchema) => updateCycle(id as string, data),
    onSuccess: async () => {
      successToast("Ciclo actualizado correctamente");
      await queryClient.invalidateQueries({
        queryKey: ["cycle", id],
      });
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      errorToast(
        error.response.data.message || "No se pudo actualizar el ciclo"
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
    } as any);
  };

  function mapCycleToForm(data: CycleResource): Partial<CycleSchema> {
    return {
      name: data.name,
      start_date: parse(data.start_date, "yyyy-MM-dd", new Date()),
      end_date: parse(data.end_date, "yyyy-MM-dd", new Date()),
      cut_off_date: parse(data.cut_off_date, "yyyy-MM-dd", new Date()),
      // start_date_objectives: parse(
      //   data.start_date_objectives,
      //   "yyyy-MM-dd",
      //   new Date()
      // ),
      // end_date_objectives: parse(
      //   data.end_date_objectives,
      //   "yyyy-MM-dd",
      //   new Date()
      // ),
      period_id: data.period_id.toString(),
      parameter_id: data.parameter_id.toString(),
      typeEvaluation: data.typeEvaluation,
    };
  }
  const { data: periods = [], isLoading: isLoadingPeriods } = useAllPeriods();
  const { data: parameters = [], isLoading: isLoadingParameters } =
    useAllParameters({
      type: "objectives",
    });

  const isLoadingAny =
    loadingCycle || !cycle || isLoadingPeriods || isLoadingParameters;

  if (isLoadingAny) {
    return <FormSkeleton />;
  }
  if (!checkRouteExists("ciclos")) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="edit"
        icon={currentView.icon}
      />
      <CycleForm
        defaultValues={mapCycleToForm(cycle)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
        periods={periods}
        parameters={parameters}
      />
    </FormWrapper>
  );
}
