"use client";

import { useNavigate } from 'react-router-dom';
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { storeParameter } from "@/features/gp/gestionhumana/evaluaciondesempeño/parametros/lib/parameter.actions";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { ParameterSchema } from "@/features/gp/gestionhumana/evaluaciondesempeño/parametros/lib/parameter.schema";
import { PARAMETER } from "@/features/gp/gestionhumana/evaluaciondesempeño/parametros/lib/parameter.constans";
import ParameterForm from "@/features/gp/gestionhumana/evaluaciondesempeño/parametros/components/ParameterForm";
import FormWrapper from "@/shared/components/FormWrapper";
import NotFound from '@/app/not-found';


const { MODEL } = PARAMETER;

export default function CreateParameterPage() {
  const router = useNavigate();
    const { currentView, checkRouteExists } = useCurrentModule();

  const { mutate, isPending } = useMutation({
    mutationFn: storeParameter,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router("./");
    },
    onError: () => {
      errorToast(ERROR_MESSAGE(MODEL, "create"));
    },
  });

  const handleSubmit = (data: ParameterSchema) => {
    mutate(data);
  };

  if (!checkRouteExists("parametros")) return <NotFound />;
  if (!currentView) return <NotFound />;

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
