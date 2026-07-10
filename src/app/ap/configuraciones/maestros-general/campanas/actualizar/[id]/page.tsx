"use client";

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { CAMPAIGN } from "@/features/ap/configuraciones/maestros-general/campanas/lib/campaign.constants";
import { CampaignResource } from "@/features/ap/configuraciones/maestros-general/campanas/lib/campaign.interface";
import { CampaignForm } from "@/features/ap/configuraciones/maestros-general/campanas/components/CampaignForm";
import { CampaignSchema } from "@/features/ap/configuraciones/maestros-general/campanas/lib/campaign.schema";
import { notFound } from "@/shared/hooks/useNotFound";
import {
  findCampaignById,
  updateCampaign,
} from "@/features/ap/configuraciones/maestros-general/campanas/lib/campaign.actions";

export default function UpdateCampaignPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL, ABSOLUTE_ROUTE } = CAMPAIGN;

  const { data: campaign, isLoading: loadingCampaign } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findCampaignById(Number(id)),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CampaignSchema) => updateCampaign(Number(id), data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, id],
      });
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "update", msg));
    },
  });

  const handleSubmit = (data: CampaignSchema) => {
    mutate(data);
  };

  function mapCampaignToForm(data: CampaignResource): Partial<CampaignSchema> {
    return {
      area_id: data.area_id?.toString() ?? "",
      code: data.code,
      name: data.name,
      description: data.description,
      start_date: data.start_date,
      end_date: data.end_date,
      discount_type: data.discount_type,
      discount_value: Number(data.discount_value),
      status: data.status,
    };
  }

  const isLoadingAny = loadingCampaign || !campaign;

  if (isLoadingAny) {
    return <FormSkeleton />;
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
      <CampaignForm
        defaultValues={mapCampaignToForm(campaign)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
