"use client";

import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { storeMetric } from "@/features/gp/gestionhumana/evaluaciondesempeño/metricas/lib/metric.actions";
import { MetricSchema } from "@/features/gp/gestionhumana/evaluaciondesempeño/metricas/lib/metric.schema";
import { MetricForm } from "@/features/gp/gestionhumana/evaluaciondesempeño/metricas/components/MetricForm";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { METRIC } from "@/features/profile/team/lib/team.constant";

export default function AddMetricPage() {
  const { MODEL } = METRIC;
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { mutate, isPending } = useMutation({
    mutationFn: storeMetric,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router("./");
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ?? ERROR_MESSAGE(MODEL, "create")
      );
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
