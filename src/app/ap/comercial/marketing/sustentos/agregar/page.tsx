"use client";

import { useNavigate, useSearchParams } from "react-router-dom";
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
import { SUPPORTS } from "@/features/ap/comercial/marketing/sustentos/lib/supports.constants";
import { storeSupports } from "@/features/ap/comercial/marketing/sustentos/lib/supports.actions";
import { SupportsSchema } from "@/features/ap/comercial/marketing/sustentos/lib/supports.schema";
import { SupportsForm } from "@/features/ap/comercial/marketing/sustentos/components/SupportsForm";
import { notFound } from "@/shared/hooks/useNotFound";

export default function AddMarketingSupportPage() {
  const router = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL, ABSOLUTE_ROUTE } = SUPPORTS;

  const { mutate, isPending } = useMutation({
    mutationFn: storeSupports,
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

  const handleSubmit = (data: SupportsSchema) => mutate(data);

  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent title={currentView.descripcion} mode="create" icon={currentView.icon} />
      <SupportsForm
        defaultValues={{
          activity_id: searchParams.get("activity_id") ?? "",
          purchase_order_id: searchParams.get("purchase_order_id") ?? "",
          type: "invoice",
          document_series: "",
          document_number: "",
          issue_date: "",
          supplier_id: "",
          currency_id: "",
          amount: undefined,
          file_path: "",
          notes: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
      />
    </FormWrapper>
  );
}
