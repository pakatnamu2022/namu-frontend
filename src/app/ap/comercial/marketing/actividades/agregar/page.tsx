"use client";

import { useNavigate } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormWrapper from "@/shared/components/FormWrapper";
import { ACTIVITIES } from "@/features/ap/comercial/marketing/actividades/lib/activities.constants";
import { storeActivities } from "@/features/ap/comercial/marketing/actividades/lib/activities.actions";
import { ActivitiesSchema } from "@/features/ap/comercial/marketing/actividades/lib/activities.schema";
import { ActivitiesForm } from "@/features/ap/comercial/marketing/actividades/components/ActivitiesForm";
import { notFound } from "@/shared/hooks/useNotFound";

export default function AddMarketingActivityPage() {
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL, ABSOLUTE_ROUTE } = ACTIVITIES;

  const { mutate, isPending } = useMutation({
    mutationFn: storeActivities,
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: ActivitiesSchema) => mutate(data);

  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent title={currentView.descripcion} mode="create" icon={currentView.icon} />
      <ActivitiesForm
        defaultValues={{
          budget_id: "",
          activity_type: "",
          name: "",
          description: "",
          objective: "",
          responsible: "",
          channel: "",
          start_date: "",
          end_date: "",
          currency_id: "",
          estimated_amount: 0,
          supplier_id: "",
          status: "planned",
          notes: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
