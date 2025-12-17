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
import { PerDiemPolicyForm } from "@/features/gp/gestionhumana/viaticos/politica-viaticos/components/PerDiemPolicyForm";
import {
  updatePerDiemPolicy,
  findPerDiemPolicyById,
} from "@/features/gp/gestionhumana/viaticos/politica-viaticos/lib/perDiemPolicy.actions";
import { PER_DIEM_POLICY } from "@/features/gp/gestionhumana/viaticos/politica-viaticos/lib/perDiemPolicy.constants";
import { notFound } from "@/shared/hooks/useNotFound";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PerDiemPolicySchemaUpdate } from "@/features/gp/gestionhumana/viaticos/politica-viaticos/lib/perDiemPolicy.schema";
import FormWrapper from "@/shared/components/FormWrapper";
import { PerDiemPolicyResource } from "@/features/gp/gestionhumana/viaticos/politica-viaticos/lib/perDiemPolicy.interface";

export default function UpdatePerDiemPolicyPage() {
  const { id } = useParams();
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { MODEL, ROUTE, ABSOLUTE_ROUTE, QUERY_KEY } = PER_DIEM_POLICY;

  const {
    data: perDiemPolicy,
    isLoading: loadingPerDiemPolicy,
    error,
  } = useQuery({
    queryKey: [QUERY_KEY, Number(id)],
    queryFn: () => findPerDiemPolicyById(Number(id)),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: PerDiemPolicySchemaUpdate) =>
      updatePerDiemPolicy(Number(id), data),
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

  const handleSubmit = (data: PerDiemPolicySchemaUpdate) => {
    mutate(data);
  };

  const handleCancel = () => {
    router(ABSOLUTE_ROUTE!);
  };

  function mapPerDiemPolicyToForm(
    data: PerDiemPolicyResource
  ): Partial<PerDiemPolicySchemaUpdate> {
    return {
      version: data.version,
      name: data.name,
      effective_from: data.effective_from,
      effective_to: data.effective_to,
      is_current: data.is_current,
      notes: data.notes || "",
    };
  }

  if (isLoadingModule || loadingPerDiemPolicy) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();
  if (error || !perDiemPolicy) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="edit"
        icon={currentView.icon}
      />
      <PerDiemPolicyForm
        defaultValues={mapPerDiemPolicyToForm(perDiemPolicy)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
        onCancel={handleCancel}
        existingDocumentPath={perDiemPolicy.document_path}
      />
    </FormWrapper>
  );
}
