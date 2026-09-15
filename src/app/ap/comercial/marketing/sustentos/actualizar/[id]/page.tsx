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
import { SUPPORTS } from "@/features/ap/comercial/marketing/sustentos/lib/supports.constants";
import { updateSupports } from "@/features/ap/comercial/marketing/sustentos/lib/supports.actions";
import { useSupportsById } from "@/features/ap/comercial/marketing/sustentos/lib/supports.hook";
import { SupportsSchema } from "@/features/ap/comercial/marketing/sustentos/lib/supports.schema";
import { SupportsResource } from "@/features/ap/comercial/marketing/sustentos/lib/supports.interface";
import { SupportsForm } from "@/features/ap/comercial/marketing/sustentos/components/SupportsForm";
import { notFound } from "@/shared/hooks/useNotFound";

function mapSupportToForm(data: SupportsResource): Partial<SupportsSchema> {
  return {
    activity_id: data.activity_id ? String(data.activity_id) : "",
    type: data.type,
    document_series: data.document_series ?? "",
    document_number: data.document_number ?? "",
    issue_date: data.issue_date ?? "",
    supplier_id: data.supplier_id ? String(data.supplier_id) : "",
    currency_id: data.currency_id ? String(data.currency_id) : "",
    amount: data.amount ?? undefined,
    notes: data.notes ?? "",
  };
}

export default function UpdateMarketingSupportPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL, ABSOLUTE_ROUTE } = SUPPORTS;

  const { data: support, isLoading: loadingSupport } = useSupportsById(Number(id));

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: { data: SupportsSchema; file: File | null }) =>
      updateSupports(Number(id), { ...payload.data, file: payload.file }),
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

  const handleSubmit = (data: SupportsSchema, files: File[]) =>
    mutate({ data, file: files[0] ?? null });

  if (loadingSupport || !support) return <FormSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent title={currentView.descripcion} mode="edit" icon={currentView.icon} />
      <SupportsForm
        defaultValues={mapSupportToForm(support)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
        existingFileUrl={support.file_path}
      />
    </FormWrapper>
  );
}
