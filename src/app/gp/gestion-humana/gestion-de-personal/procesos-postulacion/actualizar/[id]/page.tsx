"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { errorToast, successToast } from "@/core/core.function";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { notFound } from "@/shared/hooks/useNotFound";
import FormWrapper from "@/shared/components/FormWrapper";
import FormSkeleton from "@/shared/components/FormSkeleton";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { RECRUITMENT_PROCESS } from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/lib/recruitmentProcess.constant";
import {
  findRecruitmentProcessById,
  updateRecruitmentProcess,
} from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/lib/recruitmentProcess.actions";
import { RecruitmentProcessSchema } from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/lib/recruitmentProcess.schema";
import { RecruitmentProcessResource } from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/lib/recruitmentProcess.interface";
import { RecruitmentProcessForm } from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/components/RecruitmentProcessForm";

export default function UpdateRecruitmentProcessPage() {
  const { MODEL, ABSOLUTE_ROUTE, QUERY_KEY, ROUTE } = RECRUITMENT_PROCESS;
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { data: process, isLoading } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findRecruitmentProcessById(id as string),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: RecruitmentProcessSchema) =>
      updateRecruitmentProcess(id as string, {
        ...data,
        sede_id: Number(data.sede_id),
        area_id: Number(data.area_id),
        cargo_id: Number(data.cargo_id),
        cant_trab_solicita: Number(data.cant_trab_solicita),
      }),
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

  function mapToForm(
    data: RecruitmentProcessResource,
  ): Partial<RecruitmentProcessSchema> {
    return {
      nombre_postulacion: data.nombre_postulacion,
      cant_trab_solicita: data.cant_trab_solicita,
      sede_id: String(data.sede_id),
      area_id: String(data.area_id),
      cargo_id: String(data.cargo_id),
      fecha_inicio: data.fecha_inicio,
    };
  }

  if (isLoading || !process) return <FormSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="edit"
        icon={currentView.icon}
      />
      <RecruitmentProcessForm
        defaultValues={mapToForm(process)}
        defaultOptions={{
          area: process.area
            ? { value: String(process.area_id), label: process.area }
            : undefined,
          cargo: process.cargo
            ? { value: String(process.cargo_id), label: process.cargo }
            : undefined,
        }}
        onSubmit={(data) => mutate(data)}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
