"use client";

import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { CampaignForm } from "@/features/ap/configuraciones/maestros-general/campanas/components/CampaignForm";
import { storeCampaign } from "@/features/ap/configuraciones/maestros-general/campanas/lib/campaign.actions";
import { CAMPAIGN } from "@/features/ap/configuraciones/maestros-general/campanas/lib/campaign.constants";
import { CampaignSchema } from "@/features/ap/configuraciones/maestros-general/campanas/lib/campaign.schema";
import FormWrapper from "@/shared/components/FormWrapper";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { notFound } from "@/shared/hooks/useNotFound";

export default function AddCampaignPage() {
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = CAMPAIGN;

  const { mutate, isPending } = useMutation({
    mutationFn: storeCampaign,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: CampaignSchema) => {
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
      <CampaignForm
        defaultValues={{
          area_id: "",
          code: "",
          name: "",
          description: "",
          start_date: "",
          end_date: "",
          discount_type: "fixed",
          discount_value: 0,
          status: true,
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
