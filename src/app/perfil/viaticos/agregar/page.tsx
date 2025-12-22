"use client";

import TitleFormComponent from "@/shared/components/TitleFormComponent";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { PerDiemRequestForm } from "@/features/profile/viaticos/components/PerDiemRequestForm";
import { storePerDiemRequest } from "@/features/profile/viaticos/lib/perDiemRequest.actions";
import { PER_DIEM_REQUEST } from "@/features/profile/viaticos/lib/perDiemRequest.constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import FormWrapper from "@/shared/components/FormWrapper";
import { useNavigate } from "react-router-dom";

export default function AddPerDiemRequestPage() {
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { MODEL, ABSOLUTE_ROUTE, QUERY_KEY } = PER_DIEM_REQUEST;

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

  const handleSubmit = (data: any) => {
    mutate(data);
  };

  const handleCancel = () => {
    router(ABSOLUTE_ROUTE!);
  };

  return (
    <FormWrapper>
      <TitleFormComponent
        title="Agregar Solicitud de Viáticos"
        mode="create"
        icon="Plane"
      />
      <PerDiemRequestForm
        defaultValues={{
          company_id: "",
          start_date: "",
          end_date: "",
          purpose: "",
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
