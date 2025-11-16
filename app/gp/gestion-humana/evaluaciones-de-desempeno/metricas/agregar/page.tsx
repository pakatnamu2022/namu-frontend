"use client";

import { notFound, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { errorToast, successToast } from "@/src/core/core.function";
import { storeMetric } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/metricas/lib/metric.actions";
import { MetricSchema } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/metricas/lib/metric.schema";
import { MetricForm } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/metricas/components/MetricForm";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import FormWrapper from "@/src/shared/components/FormWrapper";

export default function CreateMetricPage() {
  const router = useRouter();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { mutate, isPending } = useMutation({
    mutationFn: storeMetric,
    onSuccess: () => {
      successToast("Métrica creada exitosamente");
      router.push("./");
    },
    onError: () => {
      errorToast("Hubo un error al crear la métrica");
    },
  });

  const handleSubmit = (data: MetricSchema) => {
    mutate(data);
  };
  if (!checkRouteExists("metricas")) notFound();
  if (!currentView) notFound();

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
