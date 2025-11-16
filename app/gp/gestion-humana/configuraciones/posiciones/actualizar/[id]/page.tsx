"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { errorToast, successToast, ERROR_MESSAGE, SUCCESS_MESSAGE } from "@/src/core/core.function";
import {
  findPositionById,
  updatePosition,
} from "@/src/features/gp/gestionhumana/personal/posiciones/lib/position.actions";
import { PositionSchema } from "@/src/features/gp/gestionhumana/personal/posiciones/lib/position.schema";
import { PositionResource } from "@/src/features/gp/gestionhumana/personal/posiciones/lib/position.interface";
import { PositionForm } from "@/src/features/gp/gestionhumana/personal/posiciones/components/PositionForm";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import FormSkeleton from "@/src/shared/components/FormSkeleton";
import FormWrapper from "@/src/shared/components/FormWrapper";
import { POSITION } from "@/src/features/gp/gestionhumana/personal/posiciones/lib/position.constant";

export default function EditPositionPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { MODEL, ROUTE, QUERY_KEY } = POSITION;

  const { data: position, isLoading: loadingPosition } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findPositionById(id as string),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (formData: FormData) => updatePosition(id as string, formData),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, id],
      });
      router.push("../../");
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message || ERROR_MESSAGE(MODEL, "update")
      );
    },
  });

  const handleSubmit = (data: PositionSchema) => {
    const formData = new FormData();

    // Agregar campos básicos
    formData.append("name", data.name);
    if (data.descripcion) formData.append("descripcion", data.descripcion);
    if (data.area_id) formData.append("area_id", data.area_id.toString());
    if (data.hierarchical_category_id)
      formData.append(
        "hierarchical_category_id",
        data.hierarchical_category_id.toString()
      );
    if (data.cargo_id) formData.append("cargo_id", data.cargo_id.toString());
    if (data.ntrabajadores !== undefined)
      formData.append("ntrabajadores", data.ntrabajadores.toString());

    // Agregar banda salarial
    if (data.banda_salarial_min !== undefined)
      formData.append(
        "banda_salarial_min",
        data.banda_salarial_min.toString()
      );
    if (data.banda_salarial_media !== undefined)
      formData.append(
        "banda_salarial_media",
        data.banda_salarial_media.toString()
      );
    if (data.banda_salarial_max !== undefined)
      formData.append("banda_salarial_max", data.banda_salarial_max.toString());

    // Agregar otros campos
    if (data.tipo_onboarding_id !== undefined)
      formData.append("tipo_onboarding_id", data.tipo_onboarding_id.toString());
    if (data.plazo_proceso_seleccion !== undefined)
      formData.append(
        "plazo_proceso_seleccion",
        data.plazo_proceso_seleccion.toString()
      );
    if (data.presupuesto !== undefined)
      formData.append("presupuesto", data.presupuesto.toString());

    // Agregar archivo MOF si se proporciona (opcional en actualización)
    if (data.mof_adjunto) {
      formData.append("mof_adjunto", data.mof_adjunto);
    }

    // Agregar archivos adicionales
    if (data.files && Array.isArray(data.files)) {
      data.files.forEach((file: File) => {
        formData.append("files[]", file);
      });
    }

    mutate(formData);
  };

  function mapPositionToForm(data: PositionResource): Partial<PositionSchema> {
    return {
      name: data.name,
      descripcion: data.descripcion,
      area_id: data.area_id,
      hierarchical_category_id: data.hierarchical_category_id,
      cargo_id: data.cargo_id,
      ntrabajadores: data.ntrabajadores,
      banda_salarial_min: data.banda_salarial_min
        ? parseFloat(data.banda_salarial_min)
        : undefined,
      banda_salarial_media: data.banda_salarial_media
        ? parseFloat(data.banda_salarial_media)
        : undefined,
      banda_salarial_max: data.banda_salarial_max
        ? parseFloat(data.banda_salarial_max)
        : undefined,
      tipo_onboarding_id: data.tipo_onboarding_id,
      plazo_proceso_seleccion: data.plazo_proceso_seleccion,
      presupuesto: data.presupuesto ? parseFloat(data.presupuesto) : undefined,
    };
  }

  const isLoadingAny = loadingPosition || !position;

  if (isLoadingAny) {
    return <FormSkeleton />;
  }
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="edit"
        icon={currentView.icon}
      />
      <PositionForm
        defaultValues={mapPositionToForm(position)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
