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
import { CONTRACT_TYPE } from "@/features/gp/gestionhumana/gestion-de-personal/tipos-contrato/lib/contractType.constant";
import { storeContractType } from "@/features/gp/gestionhumana/gestion-de-personal/tipos-contrato/lib/contractType.actions";
import { ContractTypeSchema } from "@/features/gp/gestionhumana/gestion-de-personal/tipos-contrato/lib/contractType.schema";
import { ContractTypeForm } from "@/features/gp/gestionhumana/gestion-de-personal/tipos-contrato/components/ContractTypeForm";

export default function AddContractTypePage() {
  const { MODEL, ABSOLUTE_ROUTE, ROUTE } = CONTRACT_TYPE;
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { mutate, isPending } = useMutation({
    mutationFn: storeContractType,
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

  const handleSubmit = (data: ContractTypeSchema) => {
    mutate({
      ...data,
      anios: data.anios === "" ? null : Number(data.anios),
      dias_vacaciones:
        data.dias_vacaciones === "" ? null : Number(data.dias_vacaciones),
    });
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
      <ContractTypeForm
        defaultValues={{ descripcion: "", anios: "", dias_vacaciones: "" }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
