"use client";

import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { notFound } from "@/shared/hooks/useNotFound";
import FormWrapper from "@/shared/components/FormWrapper";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { CONTRACT_TEMPLATE } from "@/features/gp/gestionhumana/gestion-de-personal/plantillas-contrato/lib/contractTemplate.constant";
import { storeContractTemplate } from "@/features/gp/gestionhumana/gestion-de-personal/plantillas-contrato/lib/contractTemplate.actions";
import { ContractTemplateSchema } from "@/features/gp/gestionhumana/gestion-de-personal/plantillas-contrato/lib/contractTemplate.schema";
import { ContractTemplateForm } from "@/features/gp/gestionhumana/gestion-de-personal/plantillas-contrato/components/ContractTemplateForm";

export default function AddContractTemplatePage() {
  const { MODEL, ABSOLUTE_ROUTE, ROUTE } = CONTRACT_TEMPLATE;
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { mutate, isPending } = useMutation({
    mutationFn: storeContractTemplate,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ?? ERROR_MESSAGE(MODEL, "create"),
      );
    },
  });

  const handleSubmit = (data: ContractTemplateSchema) => {
    mutate(data);
  };

  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="create"
        icon={currentView.icon}
      />
      <ContractTemplateForm
        defaultValues={{ nombre: "", descripcion: "", contenido: "" }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
