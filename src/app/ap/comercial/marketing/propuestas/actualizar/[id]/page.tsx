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
import { PROPOSALS } from "@/features/ap/comercial/marketing/propuestas/lib/proposals.constants";
import { updateProposals } from "@/features/ap/comercial/marketing/propuestas/lib/proposals.actions";
import { useProposalsById } from "@/features/ap/comercial/marketing/propuestas/lib/proposals.hook";
import { ProposalsSchema } from "@/features/ap/comercial/marketing/propuestas/lib/proposals.schema";
import { ProposalsResource } from "@/features/ap/comercial/marketing/propuestas/lib/proposals.interface";
import { ProposalsForm } from "@/features/ap/comercial/marketing/propuestas/components/ProposalsForm";
import { notFound } from "@/shared/hooks/useNotFound";

function mapProposalToForm(data: ProposalsResource): Partial<ProposalsSchema> {
  return {
    activity_id: String(data.activity_id),
    supplier_id: String(data.supplier_id),
    currency_id: String(data.currency_id),
    amount: data.amount,
    description: data.description ?? "",
    status: data.status ?? "pending",
    notes: data.notes ?? "",
  };
}

export default function UpdateMarketingProposalPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL, ABSOLUTE_ROUTE } = PROPOSALS;

  const { data: proposal, isLoading: loadingProposal } = useProposalsById(Number(id));

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ProposalsSchema) => updateProposals(Number(id), data),
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

  const handleSubmit = (data: ProposalsSchema) => mutate(data);

  if (loadingProposal || !proposal) return <FormSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent title={currentView.descripcion} mode="edit" icon={currentView.icon} />
      <ProposalsForm
        defaultValues={mapProposalToForm(proposal)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
