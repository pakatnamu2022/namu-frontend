"use client";

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import {
  updateWorkType,
} from "@/features/gp/gestionhumana/planillas/tipo-dia-trabajo/lib/work-type.actions";
import { WorkTypeSchema } from "@/features/gp/gestionhumana/planillas/tipo-dia-trabajo/lib/work-type.schema";
import { WorkTypeResource } from "@/features/gp/gestionhumana/planillas/tipo-dia-trabajo/lib/work-type.interface";
import { WorkTypeForm } from "@/features/gp/gestionhumana/planillas/tipo-dia-trabajo/components/WorkTypeForm";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { WORK_TYPE } from "@/features/gp/gestionhumana/planillas/tipo-dia-trabajo/lib/work-type.constant";
import { useWorkTypeById } from "@/features/gp/gestionhumana/planillas/tipo-dia-trabajo/lib/work-type.hook";

export default function UpdateWorkTypePage() {
  const { MODEL, ABSOLUTE_ROUTE, QUERY_KEY, ROUTE } = WORK_TYPE;
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { data: workType, isLoading: loadingWorkType } = useWorkTypeById(
    Number(id)
  );

  const { mutate, isPending } = useMutation({
    mutationFn: (data: WorkTypeSchema) => updateWorkType(Number(id), data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, id],
      });
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ?? ERROR_MESSAGE(MODEL, "update")
      );
    },
  });

  const handleSubmit = (data: WorkTypeSchema) => {
    mutate(data);
  };

  function mapWorkTypeToForm(
    data: WorkTypeResource
  ): Partial<WorkTypeSchema> {
    return {
      code: data.code,
      name: data.name,
      description: data.description ?? "",
      multiplier: data.multiplier,
      base_hours: data.base_hours,
      is_extra_hours: data.is_extra_hours,
      is_night_shift: data.is_night_shift,
      is_holiday: data.is_holiday,
      is_sunday: data.is_sunday,
      active: data.active,
      order: data.order,
    };
  }

  const isLoadingAny = loadingWorkType || !workType;

  if (isLoadingAny) {
    return <div className="p-4 text-muted">Cargando tipo día trabajo...</div>;
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
      <WorkTypeForm
        defaultValues={mapWorkTypeToForm(workType)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
