"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { errorToast, successToast } from "@/core/core.function";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { notFound } from "@/shared/hooks/useNotFound";
import PageWrapper from "@/shared/components/PageWrapper";
import FormSkeleton from "@/shared/components/FormSkeleton";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { APPLICANT } from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/lib/applicant.constant";
import {
  findApplicantById,
  updateApplicant,
} from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/lib/applicant.actions";
import { ApplicantSchema } from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/lib/applicant.schema";
import { ApplicantResource } from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/lib/applicant.interface";
import { ApplicantForm } from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/components/ApplicantForm";

export default function UpdateApplicantPage() {
  const { MODEL, ABSOLUTE_ROUTE, QUERY_KEY, ROUTE } = APPLICANT;
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { data: applicant, isLoading } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findApplicantById(id as string),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ApplicantSchema) => updateApplicant(id as string, data),
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

  function mapToForm(data: ApplicantResource): Partial<ApplicantSchema> {
    return {
      proceso_postulacion_id: String(data.proceso_postulacion_id),
      nombre_completo: data.nombre_completo ?? "",
      vat: data.vat ?? "",
      vat2: data.vat2 ?? "",
      vat3: data.vat3 ?? "",
      sexo: data.sexo ?? "",
      fecha_nacimiento: data.fecha_nacimiento ?? "",
      estado_civil: data.estado_civil ?? "",
      nacionalidad: data.nacionalidad ?? "",
      lugar_nacimiento: data.lugar_nacimiento ?? "",
      email: data.email ?? "",
      cel_personal: data.cel_personal ?? "",
      cel_refencia: data.cel_refencia ?? "",
      tel_referencia_2: data.tel_referencia_2 ?? "",
      direccion_principal: data.direccion_principal ?? "",
      direccion_ref: data.direccion_ref ?? "",
      distrito: data.distrito ?? "",
      provincia: data.provincia ?? "",
      departamento: data.departamento ?? "",
      brevete_matpel: data.brevete_matpel ?? "",
      clase_brev: data.clase_brev ?? "",
      categoria_brev: data.categoria_brev ?? "",
      institucion_tec_univ: data.institucion_tec_univ ?? "",
      carrera_tec_univ: data.carrera_tec_univ ?? "",
      nivel_alcanzado: data.nivel_alcanzado ?? "",
      grado_obtenido: data.grado_obtenido ?? "",
    };
  }

  if (isLoading || !applicant) return <FormSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <PageWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="edit"
        icon={currentView.icon}
      />
      <ApplicantForm
        defaultValues={mapToForm(applicant)}
        defaultProcessOption={
          applicant.proceso
            ? {
                value: String(applicant.proceso_postulacion_id),
                label: applicant.proceso,
              }
            : undefined
        }
        onSubmit={(data) => mutate(data)}
        isSubmitting={isPending}
        mode="update"
      />
    </PageWrapper>
  );
}
