"use client";

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  errorToast,
  successToast,
  ERROR_MESSAGE,
  SUCCESS_MESSAGE,
} from "@/core/core.function";
import { updateWorker } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.actions";
import { WorkerSignatureSchema } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.schema";
import { WorkerForm } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/components/WorkerForm";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import FormSkeleton from "@/shared/components/FormSkeleton";
import FormWrapper from "@/shared/components/FormWrapper";
import { WORKER } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.constant";
import { notFound } from "@/shared/hooks/useNotFound";
import { useWorkerById } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";

export default function UpdateWorkerSignaturePage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { MODEL, ROUTE, QUERY_KEY, ABSOLUTE_ROUTE } = WORKER;

  const { data: worker, isLoading: loadingWorker } = useWorkerById(Number(id));

  const { mutate, isPending } = useMutation({
    mutationFn: (data: WorkerSignatureSchema) =>
      updateWorker(id as string, data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, id],
      });
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message || ERROR_MESSAGE(MODEL, "update"),
      );
    },
  });

  const handleSubmit = (data: WorkerSignatureSchema) => {
    mutate(data);
  };

  function mapWorkerToForm(): Partial<WorkerSignatureSchema> {
    return {
      worker_signature: null,
    };
  }

  const isLoadingAny = loadingWorker || !worker;

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
      <WorkerForm
        defaultValues={mapWorkerToForm()}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="signature"
      />
    </FormWrapper>
  );
}
