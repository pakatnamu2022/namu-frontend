"use client";

import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { errorToast, successToast } from "@/core/core.function";
import {
  findMetricById,
  updateMetric,
} from "@/features/gp/gestionhumana/evaluaciondesempeño/metricas/lib/metric.actions";
import { MetricSchema } from "@/features/gp/gestionhumana/evaluaciondesempeño/metricas/lib/metric.schema";
import { MetricResource } from "@/features/gp/gestionhumana/evaluaciondesempeño/metricas/lib/metric.interface";
import { MetricForm } from "@/features/gp/gestionhumana/evaluaciondesempeño/metricas/components/MetricForm";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import FormSkeleton from "@/shared/components/FormSkeleton";
import FormWrapper from "@/shared/components/FormWrapper";
import NotFound from '@/app/not-found';


export default function EditMetricPage() {
    const { id } = useParams();
  const router = useNavigate();
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
      router("../");
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
  if (!checkRouteExists("metricas")) return <NotFound />;
  if (!currentView) return <NotFound />;

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
