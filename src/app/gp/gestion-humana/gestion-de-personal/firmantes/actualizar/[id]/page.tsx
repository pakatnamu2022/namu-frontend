"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { errorToast, successToast } from "@/core/core.function";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { notFound } from "@/shared/hooks/useNotFound";
import FormWrapper from "@/shared/components/FormWrapper";
import FormSkeleton from "@/shared/components/FormSkeleton";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { SIGNER } from "@/features/gp/gestionhumana/gestion-de-personal/firmantes/lib/signer.constant";
import {
  findSignerById,
  updateSigner,
} from "@/features/gp/gestionhumana/gestion-de-personal/firmantes/lib/signer.actions";
import { SignerSchema } from "@/features/gp/gestionhumana/gestion-de-personal/firmantes/lib/signer.schema";
import { SignerResource } from "@/features/gp/gestionhumana/gestion-de-personal/firmantes/lib/signer.interface";
import { SignerForm } from "@/features/gp/gestionhumana/gestion-de-personal/firmantes/components/SignerForm";

export default function UpdateSignerPage() {
  const { MODEL, ABSOLUTE_ROUTE, QUERY_KEY, ROUTE } = SIGNER;
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { data: signer, isLoading } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findSignerById(id as string),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: SignerSchema) => updateSigner(id as string, data),
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

  function mapToForm(data: SignerResource): Partial<SignerSchema> {
    return {
      nombre: data.nombre,
      persona_id: data.persona_id ? String(data.persona_id) : "",
      sucursal_id: data.sucursal_id ? String(data.sucursal_id) : "",
      fecha_vencimiento: data.fecha_vencimiento ?? "",
    };
  }

  if (isLoading || !signer) return <FormSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="edit"
        icon={currentView.icon}
      />
      <SignerForm
        defaultValues={mapToForm(signer)}
        defaultOptions={{
          persona: signer.worker_name
            ? { value: String(signer.persona_id), label: signer.worker_name }
            : undefined,
        }}
        currentFiles={{
          hasCertificate: signer.has_certificate,
          hasKey: signer.has_key,
          hasFirmaimg: signer.has_firmaimg,
        }}
        onSubmit={(data) => mutate(data)}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
