"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormSkeleton from "@/shared/components/FormSkeleton";
import FormWrapper from "@/shared/components/FormWrapper";
import { ACTIVITIES } from "@/features/ap/comercial/marketing/actividades/lib/activities.constants";
import { updateActivities } from "@/features/ap/comercial/marketing/actividades/lib/activities.actions";
import { useActivitiesById } from "@/features/ap/comercial/marketing/actividades/lib/activities.hook";
import { ActivitiesSchema } from "@/features/ap/comercial/marketing/actividades/lib/activities.schema";
import { ActivitiesResource } from "@/features/ap/comercial/marketing/actividades/lib/activities.interface";
import { ActivitiesForm } from "@/features/ap/comercial/marketing/actividades/components/ActivitiesForm";
import { notFound } from "@/shared/hooks/useNotFound";

function mapActivityToForm(data: ActivitiesResource): Partial<ActivitiesSchema> {
  return {
    budget_id: String(data.budget_id),
    activity_type: data.activity_type,
    name: data.name,
    description: data.description ?? "",
    objective: data.objective ?? "",
    responsible: data.responsible ?? "",
    channel: data.channel ?? "",
    start_date: data.start_date ?? "",
    end_date: data.end_date ?? "",
    currency_id: String(data.currency_id),
    estimated_amount: data.estimated_amount,
    supplier_id: data.supplier_id ? String(data.supplier_id) : "",
    status: data.status ?? "planned",
    notes: data.notes ?? "",
  };
}

export default function UpdateMarketingActivityPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL, ABSOLUTE_ROUTE } = ACTIVITIES;

  const { data: activity, isLoading: loadingActivity } = useActivitiesById(Number(id));

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ActivitiesSchema) => updateActivities(Number(id), data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "update", msg));
    },
  });

  const handleSubmit = (data: ActivitiesSchema) => mutate(data);

  if (loadingActivity || !activity) return <FormSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent title={currentView.descripcion} mode="edit" icon={currentView.icon} />
      <ActivitiesForm
        defaultValues={mapActivityToForm(activity)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
