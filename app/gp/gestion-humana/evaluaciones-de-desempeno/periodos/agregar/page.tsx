"use client";

import { notFound, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { errorToast, successToast } from "@/src/core/core.function";
import { storePeriod } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/periodos/lib/period.actions";
import { PeriodSchema } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/periodos/lib/period.schema";
import { PeriodForm } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/periodos/components/PeriodForm";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import FormWrapper from "@/src/shared/components/FormWrapper";

export default function CreatePeriodPage() {
  const router = useRouter();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { mutate, isPending } = useMutation({
    mutationFn: storePeriod,
    onSuccess: () => {
      successToast("Periodo creado exitosamente");
      router.push("./");
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
  if (!currentView) notFound();

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
