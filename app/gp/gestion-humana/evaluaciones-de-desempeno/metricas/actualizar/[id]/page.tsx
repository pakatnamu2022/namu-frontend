"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { errorToast, successToast } from "@/src/core/core.function";
import {
  findMetricById,
  updateMetric,
} from "@/src/features/gp/gestionhumana/evaluaciondesempeño/metricas/lib/metric.actions";
import { MetricSchema } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/metricas/lib/metric.schema";
import { MetricResource } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/metricas/lib/metric.interface";
import { MetricForm } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/metricas/components/MetricForm";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import FormSkeleton from "@/src/shared/components/FormSkeleton";
import FormWrapper from "@/src/shared/components/FormWrapper";

export default function EditMetricPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { data: metric, isLoading: loadingMetric } = useQuery({
    queryKey: ["metric", id],
    queryFn: () => findMetricById(id as string),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: MetricSchema) => updateMetric(id as string, data),
    onSuccess: async () => {
      successToast("Métrica actualizada correctamente");
      await queryClient.invalidateQueries({
        queryKey: ["metric", id],
      });
      router.push("../");
    },
    onError: () => {
      errorToast("No se pudo actualizar la métrica");
    },
  });

  const handleSubmit = (data: MetricSchema) => {
    mutate(data);
  };

  function mapMetricToForm(data: MetricResource): Partial<MetricSchema> {
    return {
      name: data.name,
      description: data.description ?? "",
    };
  }

  const isLoadingAny = loadingMetric || !metric;

  if (isLoadingAny) {
    return <FormSkeleton />;
  }
  if (!checkRouteExists("metricas")) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="edit"
        icon={currentView.icon}
      />
      <MetricForm
        defaultValues={mapMetricToForm(metric)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
