"use client";

import { useNavigate } from 'react-router-dom';
import { useMutation } from "@tanstack/react-query";
import { errorToast, successToast } from "@/core/core.function";
import { storePeriod } from "@/features/gp/gestionhumana/evaluaciondesempeño/periodos/lib/period.actions";
import { PeriodSchema } from "@/features/gp/gestionhumana/evaluaciondesempeño/periodos/lib/period.schema";
import { PeriodForm } from "@/features/gp/gestionhumana/evaluaciondesempeño/periodos/components/PeriodForm";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormWrapper from "@/shared/components/FormWrapper";
import NotFound from "@/app/not-found";


export default function CreatePeriodPage() {
  const router = useNavigate();
    const { currentView, checkRouteExists } = useCurrentModule();

  const { mutate, isPending } = useMutation({
    mutationFn: storePeriod,
    onSuccess: () => {
      successToast("Periodo creado exitosamente");
      router("./");
    },
    onError: (error: any) => {
      errorToast(
        error.response.data.message ?? "Hubo un error al crear el periodo"
      );
    },
  });

  const handleSubmit = (data: PeriodSchema) => {
    mutate(data);
  };
  if (!checkRouteExists("periodos")) notFound();
  if (!currentView) return <NotFound />;

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="create"
        icon={currentView.icon}
      />
      <PeriodForm
        defaultValues={{
          name: "",
          start_date: new Date(),
          end_date: new Date(),
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
   </FormWrapper>
  );
}
