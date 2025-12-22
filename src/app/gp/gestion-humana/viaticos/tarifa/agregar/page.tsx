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
import FormWrapper from "@/shared/components/FormWrapper";
import { PER_DIEM_RATE } from "@/features/gp/gestionhumana/viaticos/tarifa/lib/perDiemRate.constants";
import { storePerDiemRate } from "@/features/gp/gestionhumana/viaticos/tarifa/lib/perDiemRate.actions";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { PerDiemRateForm } from "@/features/gp/gestionhumana/viaticos/tarifa/components/PerDiemRateForm";
import { notFound } from "@/shared/hooks/useNotFound";

export default function AddPerDiemRatePage() {
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = PER_DIEM_RATE;

  const { mutate, isPending } = useMutation({
    mutationFn: storePerDiemRate,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: any) => {
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
      <PerDiemRateForm
        defaultValues={{
          per_diem_policy_id: "",
          district_id: "",
          expense_type_id: "",
          per_diem_category_id: "",
          daily_amount: 0,
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
