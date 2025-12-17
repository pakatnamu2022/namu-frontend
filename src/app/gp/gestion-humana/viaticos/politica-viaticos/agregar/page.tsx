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
import { PerDiemPolicyForm } from "@/features/gp/gestionhumana/viaticos/politica-viaticos/components/PerDiemPolicyForm";
import { storePerDiemPolicy } from "@/features/gp/gestionhumana/viaticos/politica-viaticos/lib/perDiemPolicy.actions";
import { PER_DIEM_POLICY } from "@/features/gp/gestionhumana/viaticos/politica-viaticos/lib/perDiemPolicy.constants";
import { notFound } from "@/shared/hooks/useNotFound";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PerDiemPolicySchema } from "@/features/gp/gestionhumana/viaticos/politica-viaticos/lib/perDiemPolicy.schema";
import FormWrapper from "@/shared/components/FormWrapper";
import { useNavigate } from "react-router-dom";

export default function AddPerDiemPolicyPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { MODEL, ROUTE, ABSOLUTE_ROUTE, QUERY_KEY } = PER_DIEM_POLICY;

  const { mutate, isPending } = useMutation({
    mutationFn: storePerDiemPolicy,
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

  const handleSubmit = (data: PerDiemPolicySchema) => {
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
      <PerDiemPolicyForm
        defaultValues={{
          version: "",
          name: "",
          effective_from: "",
          effective_to: "",
          is_current: false,
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
