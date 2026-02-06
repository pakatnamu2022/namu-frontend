"use client";

import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import {
  storeWorkType,
  storeWorkTypeSegment
} from "@/features/gp/gestionhumana/planillas/tipo-dia-trabajo/lib/work-type.actions";
import { WorkTypeForm } from "@/features/gp/gestionhumana/planillas/tipo-dia-trabajo/components/WorkTypeForm";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { WorkTypeSchema } from "@/features/gp/gestionhumana/planillas/tipo-dia-trabajo/lib/work-type.schema";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { WORK_TYPE } from "@/features/gp/gestionhumana/planillas/tipo-dia-trabajo/lib/work-type.constant";

export default function AddWorkTypePage() {
  const { MODEL, ABSOLUTE_ROUTE, ROUTE } = WORK_TYPE;
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: WorkTypeSchema) => {
      // 1. Create WorkType first (without segments)
      const workTypePayload = {
        code: data.code,
        name: data.name,
        description: data.description,
        multiplier: data.multiplier,
        base_hours: data.base_hours,
        is_extra_hours: data.is_extra_hours,
        is_night_shift: data.is_night_shift,
        is_holiday: data.is_holiday,
        is_sunday: data.is_sunday,
        active: data.active,
        order: data.order,
        shift_type: data.shift_type,
      };

      const workTypeResponse = await storeWorkType(workTypePayload);

      // Extract the ID from the response
      const workTypeId = workTypeResponse.id;

      if (!workTypeId) {
        throw new Error("No se pudo obtener el ID del tipo de trabajo creado");
      }

      // 2. Create each segment individually
      if (data.segments && data.segments.length > 0) {
        for (let index = 0; index < data.segments.length; index++) {
          const segment = data.segments[index];
          const segmentPayload = {
            work_type_id: workTypeId,
            segment_type: segment.segment_type,
            segment_order: index + 1,
            duration_hours: segment.duration_hours,
            multiplier: segment.multiplier,
            description: segment.description || "",
          };

          await storeWorkTypeSegment(workTypeId, segmentPayload);
        }
      }

      return workTypeResponse;
    },
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ?? ERROR_MESSAGE(MODEL, "create")
      );
    },
  });

  const handleSubmit = async (data: WorkTypeSchema) => {
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
      <WorkTypeForm
        defaultValues={{
          code: "",
          name: "",
          description: "",
          multiplier: 1,
          base_hours: 12,
          is_extra_hours: false,
          is_night_shift: false,
          is_holiday: false,
          is_sunday: false,
          active: true,
          order: 0,
          shift_type: "MORNING",
          segments: [],
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
