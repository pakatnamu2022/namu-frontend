"use client";

import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { storeWorkType } from "@/features/gp/gestionhumana/planillas/tipo-dia-trabajo/lib/work-type.actions";
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
    mutationFn: storeWorkType,
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

  const handleSubmit = (data: WorkTypeSchema) => {
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
          base_hours: 8,
          is_extra_hours: false,
          is_night_shift: false,
          is_holiday: false,
          is_sunday: false,
          active: true,
          order: 0,
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
