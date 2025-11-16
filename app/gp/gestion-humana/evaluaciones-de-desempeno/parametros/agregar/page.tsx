"use client";

import { notFound, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import { storeParameter } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/parametros/lib/parameter.actions";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import { ParameterSchema } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/parametros/lib/parameter.schema";
import { PARAMETER } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/parametros/lib/parameter.constans";
import ParameterForm from "@/src/features/gp/gestionhumana/evaluaciondesempeño/parametros/components/ParameterForm";
import FormWrapper from "@/src/shared/components/FormWrapper";

const { MODEL } = PARAMETER;

export default function CreateParameterPage() {
  const router = useRouter();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { mutate, isPending } = useMutation({
    mutationFn: storeParameter,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router.push("./");
    },
    onError: () => {
      errorToast(ERROR_MESSAGE(MODEL, "create"));
    },
  });

  const handleSubmit = (data: ParameterSchema) => {
    mutate(data);
  };

  if (!checkRouteExists("parametros")) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="create"
        icon={currentView.icon}
      />
      <ParameterForm
        defaultValues={{
          name: "",
          type: "objectives",
          detailsCount: "4",
          details: [
            { label: "", from: 0, to: 0 },
            { label: "", from: 0, to: 0 },
            { label: "", from: 0, to: 0 },
            { label: "", from: 0, to: 0 },
          ],
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
