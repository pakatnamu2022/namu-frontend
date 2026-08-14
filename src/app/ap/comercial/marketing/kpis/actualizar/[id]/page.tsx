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
import { KPIS } from "@/features/ap/comercial/marketing/kpis/lib/kpis.constants";
import { updateKpis } from "@/features/ap/comercial/marketing/kpis/lib/kpis.actions";
import { useKpisById } from "@/features/ap/comercial/marketing/kpis/lib/kpis.hook";
import { KpisSchema } from "@/features/ap/comercial/marketing/kpis/lib/kpis.schema";
import { KpisResource } from "@/features/ap/comercial/marketing/kpis/lib/kpis.interface";
import { KpisForm } from "@/features/ap/comercial/marketing/kpis/components/KpisForm";
import { notFound } from "@/shared/hooks/useNotFound";

function mapKpiToForm(data: KpisResource): Partial<KpisSchema> {
  return {
    activity_id: String(data.activity_id),
    period_month: data.period_month ? String(data.period_month) : "",
    period_year: data.period_year ?? undefined,
    leads: data.leads ?? undefined,
    sales: data.sales ?? undefined,
    investment: data.investment ?? undefined,
    currency_id: data.currency_id ? String(data.currency_id) : "",
    notes: data.notes ?? "",
  };
}

export default function UpdateMarketingKpiPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL, ABSOLUTE_ROUTE } = KPIS;

  const { data: kpi, isLoading: loadingKpi } = useKpisById(Number(id));

  const { mutate, isPending } = useMutation({
    mutationFn: (data: KpisSchema) => updateKpis(Number(id), data),
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

  const handleSubmit = (data: KpisSchema) => mutate(data);

  if (loadingKpi || !kpi) return <FormSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent title={currentView.descripcion} mode="edit" icon={currentView.icon} />
      <KpisForm
        defaultValues={mapKpiToForm(kpi)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
