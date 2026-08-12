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
import { PROPOSALS } from "@/features/ap/comercial/marketing/propuestas/lib/proposals.constants";
import { storeProposals } from "@/features/ap/comercial/marketing/propuestas/lib/proposals.actions";
import { ProposalsSchema } from "@/features/ap/comercial/marketing/propuestas/lib/proposals.schema";
import { ProposalsForm } from "@/features/ap/comercial/marketing/propuestas/components/ProposalsForm";
import { notFound } from "@/shared/hooks/useNotFound";

export default function AddMarketingProposalPage() {
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = PROPOSALS;

  const { mutate, isPending } = useMutation({
    mutationFn: storeProposals,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: ProposalsSchema) => mutate(data);

  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent title={currentView.descripcion} mode="create" icon={currentView.icon} />
      <ProposalsForm
        defaultValues={{
          activity_id: "",
          supplier_id: "",
          currency_id: "",
          amount: 0,
          description: "",
          status: "pending",
          notes: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
