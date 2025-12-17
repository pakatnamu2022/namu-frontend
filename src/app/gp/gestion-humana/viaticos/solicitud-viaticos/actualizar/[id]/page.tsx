"use client";

import { useNavigate, useParams } from "react-router-dom";
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
import {
  updatePerDiemRequest,
  findPerDiemRequestById,
} from "@/features/gp/gestionhumana/viaticos/solicitud-viaticos/lib/perDiemRequest.actions";
import { PER_DIEM_REQUEST } from "@/features/gp/gestionhumana/viaticos/solicitud-viaticos/lib/perDiemRequest.constants";
import { notFound } from "@/shared/hooks/useNotFound";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PerDiemRequestSchemaUpdate } from "@/features/gp/gestionhumana/viaticos/solicitud-viaticos/lib/perDiemRequest.schema";
import FormWrapper from "@/shared/components/FormWrapper";
import { PerDiemRequestResource } from "@/features/gp/gestionhumana/viaticos/solicitud-viaticos/lib/perDiemRequest.interface";

export default function UpdatePerDiemRequestPage() {
  const { id } = useParams();
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { MODEL, ROUTE, ABSOLUTE_ROUTE, QUERY_KEY } = PER_DIEM_REQUEST;

  const {
    data: perDiemRequest,
    isLoading: loadingPerDiemRequest,
    error,
  } = useQuery({
    queryKey: [QUERY_KEY, Number(id)],
    queryFn: () => findPerDiemRequestById(Number(id)),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: PerDiemRequestSchemaUpdate) =>
      updatePerDiemRequest(Number(id), data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY],
      });
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, Number(id)],
      });
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "update", msg));
    },
  });

  const handleSubmit = (data: PerDiemRequestSchemaUpdate) => {
    mutate(data);
  };

  const handleCancel = () => {
    router(ABSOLUTE_ROUTE!);
  };

  function mapPerDiemRequestToForm(
    data: PerDiemRequestResource
  ): Partial<PerDiemRequestSchemaUpdate> {
    return {
      start_date: data.start_date ? new Date(data.start_date) : "",
      end_date: data.end_date ? new Date(data.end_date) : "",
      purpose: data.purpose,
      notes: data.notes || "",
      status: data.status,
      paid: data.paid,
      payment_date: data.payment_date ? new Date(data.payment_date) : "",
      settled: data.settled,
      settlement_date: data.settlement_date
        ? new Date(data.settlement_date)
        : "",
      total_spent: data.total_spent,
      balance_to_return: data.balance_to_return,
    };
  }

  if (isLoadingModule || loadingPerDiemRequest) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();
  if (error || !perDiemRequest) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="edit"
        icon={currentView.icon}
      />
      <PerDiemRequestForm
        defaultValues={mapPerDiemRequestToForm(perDiemRequest)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
        onCancel={handleCancel}
      />
    </FormWrapper>
  );
}
