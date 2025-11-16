"use client";

import { useNavigate } from 'react-router-dom';
import { useMutation } from "@tanstack/react-query";
import { errorToast, successToast } from "@/core/core.function";
import { storeMetric } from "@/features/gp/gestionhumana/evaluaciondesempeño/metricas/lib/metric.actions";
import { MetricSchema } from "@/features/gp/gestionhumana/evaluaciondesempeño/metricas/lib/metric.schema";
import { MetricForm } from "@/features/gp/gestionhumana/evaluaciondesempeño/metricas/components/MetricForm";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormWrapper from "@/shared/components/FormWrapper";
import NotFound from "@/app/not-found";


export default function CreateMetricPage() {
  const router = useNavigate();
    const { currentView, checkRouteExists } = useCurrentModule();

  const { mutate, isPending } = useMutation({
    mutationFn: storeMetric,
    onSuccess: () => {
      successToast("Métrica creada exitosamente");
      router("./");
    },
    onError: () => {
      errorToast("Hubo un error al crear la métrica");
    },
  });

  const handleSubmit = (data: MetricSchema) => {
    mutate(data);
  };
  if (!checkRouteExists("metricas")) notFound();
  if (!currentView) return <NotFound />;

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="create"
        icon={currentView.icon}
      />
      <MetricForm
        defaultValues={{
          name: "",
          description: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
