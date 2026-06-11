"use client";

import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { importWorkingConditions } from "@/features/gp/gestionhumana/planillas/working-conditions/lib/working-condition.actions";
import { WorkingConditionForm } from "@/features/gp/gestionhumana/planillas/working-conditions/components/WorkingConditionForm";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { WorkingConditionSchema } from "@/features/gp/gestionhumana/planillas/working-conditions/lib/working-condition.schema";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { WORKING_CONDITION } from "@/features/gp/gestionhumana/planillas/working-conditions/lib/working-condition.constant";

export default function AddWorkingConditionPage() {
  const { MODEL, ABSOLUTE_ROUTE, ROUTE } = WORKING_CONDITION;
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { mutate, isPending } = useMutation({
    mutationFn: ({
      data,
      file,
    }: {
      data: WorkingConditionSchema;
      file: File;
    }) => importWorkingConditions(file, data.period_id),
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

  const handleSubmit = (data: WorkingConditionSchema, file: File) => {
    mutate({ data, file });
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
      <WorkingConditionForm onSubmit={handleSubmit} isSubmitting={isPending} />
    </FormWrapper>
  );
}
