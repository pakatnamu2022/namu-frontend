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
import { PER_DIEM_RATE } from "@/features/gp/gestionhumana/viaticos/tarifa/lib/perDiemRate.constants";
import {
  findPerDiemRateById,
  updatePerDiemRate,
} from "@/features/gp/gestionhumana/viaticos/tarifa/lib/perDiemRate.actions";
import {
  PerDiemRateRequest,
  PerDiemRateResource,
} from "@/features/gp/gestionhumana/viaticos/tarifa/lib/perDiemRate.interface";
import { PerDiemRateForm } from "@/features/gp/gestionhumana/viaticos/tarifa/components/PerDiemRateForm";
import { notFound } from "@/shared/hooks/useNotFound";
import { PerDiemRateSchema } from "@/features/gp/gestionhumana/viaticos/tarifa/lib/perDiemRate.schema";

export default function UpdatePerDiemRatePage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL, ABSOLUTE_ROUTE } = PER_DIEM_RATE;

  const { data: perDiemRate, isLoading: loadingPerDiemRate } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findPerDiemRateById(Number(id)),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: PerDiemRateRequest) =>
      updatePerDiemRate(Number(id), data),
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

  const handleSubmit = (data: PerDiemRateRequest) => {
    mutate(data);
  };

  function mapPerDiemRateToForm(
    data: PerDiemRateResource
  ): Partial<PerDiemRateSchema> {
    return {
      per_diem_policy_id: String(data.per_diem_policy_id),
      district_id: String(data.district_id),
      expense_type_id: String(data.expense_type_id),
      per_diem_category_id: String(data.per_diem_category_id),
      daily_amount: data.daily_amount,
    };
  }

  const isLoadingAny = loadingPerDiemRate || !perDiemRate;

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
      <PerDiemRateForm
        defaultValues={mapPerDiemRateToForm(perDiemRate)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
