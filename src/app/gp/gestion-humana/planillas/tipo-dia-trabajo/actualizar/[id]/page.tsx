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
  storeWorkTypeSegment,
  updateWorkTypeSegment,
  deleteWorkTypeSegment,
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
    mutationFn: async (data: WorkTypeSchema) => {
      const workTypeId = Number(id);

      // 1. Update WorkType first (without segments)
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

      const workTypeResponse = await updateWorkType(workTypeId, workTypePayload);

      // 2. Get existing segment IDs from original data
      const existingSegmentIds = workType?.segments?.map(s => s.id) || [];

      // 3. Get current segment IDs from form data
      const currentSegmentIds = data.segments?.filter(s => s.id).map(s => s.id!) || [];

      // 4. Delete segments that were removed
      const segmentsToDelete = existingSegmentIds.filter(
        existingId => !currentSegmentIds.includes(existingId)
      );

      for (const segmentId of segmentsToDelete) {
        await deleteWorkTypeSegment(workTypeId, segmentId);
      }

      // 5. Create or update segments
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

          if (segment.id) {
            // Update existing segment
            await updateWorkTypeSegment(workTypeId, segment.id, segmentPayload);
          } else {
            // Create new segment
            await storeWorkTypeSegment(workTypeId, segmentPayload);
          }
        }
      }

      return workTypeResponse;
    },
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

  const handleSubmit = async (data: WorkTypeSchema) => {
    mutate(data);
  };

  function mapWorkTypeToForm(
    data: WorkTypeResource
  ): Partial<WorkTypeSchema> {
    // Map segments from API response to form format
    const segments = data.segments?.map((segment) => {
      // Calculate start_hour based on segment_order and previous segments
      let startHour = data.shift_type === "MORNING" ? 7 : 19;

      if (data.segments) {
        for (let i = 0; i < segment.segment_order - 1; i++) {
          const prevSegment = data.segments.find(s => s.segment_order === i + 1);
          if (prevSegment) {
            startHour += prevSegment.duration_hours;
          }
        }
      }

      const endHour = startHour + segment.duration_hours;

      return {
        id: segment.id,
        segment_type: segment.segment_type,
        segment_order: segment.segment_order,
        start_hour: startHour,
        end_hour: endHour,
        duration_hours: segment.duration_hours,
        multiplier: segment.multiplier,
        description: segment.description || "",
      };
    }) || [];

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
      shift_type: data.shift_type || "MORNING",
      segments: segments,
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
