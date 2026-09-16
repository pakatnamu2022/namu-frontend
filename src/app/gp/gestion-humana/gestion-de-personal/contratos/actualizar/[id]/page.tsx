"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { errorToast, successToast } from "@/core/core.function";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { notFound } from "@/shared/hooks/useNotFound";
import FormWrapper from "@/shared/components/FormWrapper";
import FormSkeleton from "@/shared/components/FormSkeleton";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { CONTRACT } from "@/features/gp/gestionhumana/gestion-de-personal/contratos/lib/contract.constant";
import {
  findContractById,
  updateContract,
} from "@/features/gp/gestionhumana/gestion-de-personal/contratos/lib/contract.actions";
import { ContractSchema } from "@/features/gp/gestionhumana/gestion-de-personal/contratos/lib/contract.schema";
import { ContractResource } from "@/features/gp/gestionhumana/gestion-de-personal/contratos/lib/contract.interface";
import { ContractForm } from "@/features/gp/gestionhumana/gestion-de-personal/contratos/components/ContractForm";

function toPayload(data: Partial<ContractSchema>) {
  return {
    ...data,
    empleado_id: data.empleado_id ? Number(data.empleado_id) : undefined,
    tipo_contrato_id: data.tipo_contrato_id ? Number(data.tipo_contrato_id) : undefined,
    template_contrato_id: data.template_contrato_id
      ? Number(data.template_contrato_id)
      : undefined,
    sede_id: data.sede_id ? Number(data.sede_id) : undefined,
    cargo_id: data.cargo_id ? Number(data.cargo_id) : undefined,
    sueldo: data.sueldo !== undefined ? Number(data.sueldo) : undefined,
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

export default function UpdateContractPage() {
  const { MODEL, ABSOLUTE_ROUTE, QUERY_KEY, ROUTE } = CONTRACT;
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { data: contract, isLoading } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findContractById(id as string),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ContractSchema) => updateContract(id as string, toPayload(data)),
    onSuccess: async () => {
      successToast(`${MODEL.name} actualizado correctamente.`);
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ??
          `No se pudo actualizar el ${MODEL.name.toLowerCase()}.`,
      );
    },
  });

  function mapToForm(data: ContractResource): Partial<ContractSchema> {
    return {
      empleado_id: String(data.empleado_id),
      tipo_contrato_id: String(data.tipo_contrato_id),
      template_contrato_id: String(data.template_contrato_id),
      sede_id: String(data.sede_id),
      cargo_id: String(data.cargo_id),
      sueldo: data.sueldo,
      fecha_inicio_actividades: data.fecha_inicio_actividades ?? "",
      fecha_inicio_contrato: data.fecha_inicio_contrato,
      fecha_fin_contrato: data.fecha_fin_contrato ?? "",
      observacion: data.observacion ?? "",
      grupo_contrato: data.grupo_contrato ?? "",
      contrato_principal: data.contrato_principal ? String(data.contrato_principal) : "",
      convenio: data.convenio ?? "",
      firmante_id: data.firmante_id ? String(data.firmante_id) : "",
      firmante_sec_id: data.firmante_sec_id ? String(data.firmante_sec_id) : "",
      lote: data.lote ?? "",
    };
  }

  if (isLoading || !contract) return <FormSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="edit"
        icon={currentView.icon}
      />
      <ContractForm
        defaultValues={mapToForm(contract)}
        defaultOptions={{
          empleado: contract.trabajador
            ? { value: String(contract.empleado_id), label: contract.trabajador }
            : undefined,
          cargo: contract.cargo
            ? { value: String(contract.cargo_id), label: contract.cargo }
            : undefined,
        }}
        onSubmit={(data) => mutate(data)}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
