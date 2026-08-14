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
import { PLANS } from "@/features/ap/comercial/marketing/planes/lib/plans.constants";
import { updatePlans } from "@/features/ap/comercial/marketing/planes/lib/plans.actions";
import { usePlansById } from "@/features/ap/comercial/marketing/planes/lib/plans.hook";
import { PlansSchema } from "@/features/ap/comercial/marketing/planes/lib/plans.schema";
import { PlansResource } from "@/features/ap/comercial/marketing/planes/lib/plans.interface";
import { PlansForm } from "@/features/ap/comercial/marketing/planes/components/PlansForm";
import { notFound } from "@/shared/hooks/useNotFound";

function mapPlanToForm(data: PlansResource): Partial<PlansSchema> {
  return {
    name: data.name,
    concept: data.concept ?? "",
    brand_id: data.brand_id ? String(data.brand_id) : "",
    year: data.year,
    description: data.description ?? "",
    status: data.status ?? "draft",
  };
}

export default function UpdateMarketingPlanPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL, ABSOLUTE_ROUTE } = PLANS;

  const { data: plan, isLoading: loadingPlan } = usePlansById(Number(id));

  const { mutate, isPending } = useMutation({
    mutationFn: (data: PlansSchema) => updatePlans(Number(id), data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "update", msg));
    },
  });

  const handleSubmit = (data: PlansSchema) => mutate(data);

  if (loadingPlan || !plan) return <FormSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent title={currentView.descripcion} mode="edit" icon={currentView.icon} />
      <PlansForm
        defaultValues={mapPlanToForm(plan)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
