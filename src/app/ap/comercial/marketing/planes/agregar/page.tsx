"use client";

import { useNavigate } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormWrapper from "@/shared/components/FormWrapper";
import { PLANS } from "@/features/ap/comercial/marketing/planes/lib/plans.constants";
import { storePlans } from "@/features/ap/comercial/marketing/planes/lib/plans.actions";
import { PlansSchema } from "@/features/ap/comercial/marketing/planes/lib/plans.schema";
import { PlansForm } from "@/features/ap/comercial/marketing/planes/components/PlansForm";
import { notFound } from "@/shared/hooks/useNotFound";

export default function AddMarketingPlanPage() {
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = PLANS;

  const { mutate, isPending } = useMutation({
    mutationFn: storePlans,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: PlansSchema) => mutate(data);

  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="create"
        icon={currentView.icon}
      />
      <PlansForm
        defaultValues={{
          name: "",
          concept: "",
          brand_id: "",
          year: new Date().getFullYear(),
          description: "",
          status: "draft",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
