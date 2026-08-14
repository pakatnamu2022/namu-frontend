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
import { KPIS } from "@/features/ap/comercial/marketing/kpis/lib/kpis.constants";
import { storeKpis } from "@/features/ap/comercial/marketing/kpis/lib/kpis.actions";
import { KpisSchema } from "@/features/ap/comercial/marketing/kpis/lib/kpis.schema";
import { KpisForm } from "@/features/ap/comercial/marketing/kpis/components/KpisForm";
import { notFound } from "@/shared/hooks/useNotFound";

export default function AddMarketingKpiPage() {
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL, ABSOLUTE_ROUTE } = KPIS;

  const { mutate, isPending } = useMutation({
    mutationFn: storeKpis,
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

  const handleSubmit = (data: KpisSchema) => mutate(data);

  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent title={currentView.descripcion} mode="create" icon={currentView.icon} />
      <KpisForm
        defaultValues={{
          activity_id: "",
          period_month: "",
          period_year: new Date().getFullYear(),
          leads: undefined,
          sales: undefined,
          investment: undefined,
          currency_id: "",
          notes: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
