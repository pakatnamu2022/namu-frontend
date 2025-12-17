"use client";

import PageSkeleton from "@/shared/components/PageSkeleton";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { PerDiemRequestForm } from "@/features/gp/gestionhumana/viaticos/solicitud-viaticos/components/PerDiemRequestForm";
import { storePerDiemRequest } from "@/features/gp/gestionhumana/viaticos/solicitud-viaticos/lib/perDiemRequest.actions";
import { PER_DIEM_REQUEST } from "@/features/gp/gestionhumana/viaticos/solicitud-viaticos/lib/perDiemRequest.constants";
import { notFound } from "@/shared/hooks/useNotFound";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PerDiemRequestSchema } from "@/features/gp/gestionhumana/viaticos/solicitud-viaticos/lib/perDiemRequest.schema";
import FormWrapper from "@/shared/components/FormWrapper";
import { useNavigate } from "react-router-dom";

export default function AddPerDiemRequestPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { MODEL, ROUTE, ABSOLUTE_ROUTE, QUERY_KEY } = PER_DIEM_REQUEST;

  const { mutate, isPending } = useMutation({
    mutationFn: storePerDiemRequest,
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY],
      });
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: PerDiemRequestSchema) => {
    mutate(data);
  };

  const handleCancel = () => {
    router(ABSOLUTE_ROUTE!);
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="create"
        icon={currentView.icon}
      />
      <PerDiemRequestForm
        defaultValues={{
          per_diem_policy_id: "",
          employee_id: "",
          company_id: "",
          per_diem_category_id: "",
          start_date: "",
          end_date: "",
          purpose: "",
          final_result: "",
          total_budget: 0,
          cash_amount: 0,
          transfer_amount: 0,
          payment_method: "",
          notes: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
        onCancel={handleCancel}
      />
    </FormWrapper>
  );
}
