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
import { CONTRACT } from "@/features/gp/gestionhumana/gestion-de-personal/contratos/lib/contract.constant";
import { storeContract } from "@/features/gp/gestionhumana/gestion-de-personal/contratos/lib/contract.actions";
import { ContractSchema } from "@/features/gp/gestionhumana/gestion-de-personal/contratos/lib/contract.schema";
import { ContractForm } from "@/features/gp/gestionhumana/gestion-de-personal/contratos/components/ContractForm";

function toPayload(data: ContractSchema) {
  return {
    ...data,
    empleado_id: Number(data.empleado_id),
    tipo_contrato_id: Number(data.tipo_contrato_id),
    template_contrato_id: Number(data.template_contrato_id),
    sede_id: Number(data.sede_id),
    cargo_id: Number(data.cargo_id),
    sueldo: Number(data.sueldo),
    fecha_inicio_actividades: data.fecha_inicio_actividades || null,
    fecha_fin_contrato: data.fecha_fin_contrato || null,
    observacion: data.observacion || null,
    grupo_contrato: data.grupo_contrato || null,
    contrato_principal: data.contrato_principal ? Number(data.contrato_principal) : null,
    convenio: data.convenio || null,
    firmante_id: data.firmante_id ? Number(data.firmante_id) : null,
    firmante_sec_id: data.firmante_sec_id ? Number(data.firmante_sec_id) : null,
    lote: data.lote || null,
  };
}

export default function AddContractPage() {
  const { MODEL, ABSOLUTE_ROUTE, ROUTE } = CONTRACT;
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { mutate, isPending } = useMutation({
    mutationFn: storeContract,
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

  const handleSubmit = (data: ContractSchema) => {
    mutate(toPayload(data));
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
      <ContractForm defaultValues={{}} onSubmit={handleSubmit} isSubmitting={isPending} mode="create" />
    </FormWrapper>
  );
}
