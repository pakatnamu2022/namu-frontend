"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  errorToast,
  successToast,
  ERROR_MESSAGE,
  SUCCESS_MESSAGE,
} from "@/core/core.function";
import { updateWorker } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.actions";
import type { WorkerSchema } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.schema";
import { WorkerForm } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/components/WorkerForm";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import FormSkeleton from "@/shared/components/FormSkeleton";
import PageWrapper from "@/shared/components/PageWrapper";
import { WORKER } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.constant";
import { notFound } from "@/shared/hooks/useNotFound";
import { useWorkerById } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";

export default function UpdateWorkerPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { MODEL, ROUTE, QUERY_KEY, ABSOLUTE_ROUTE } = WORKER;

  const { data: worker, isLoading: loadingWorker } = useWorkerById(Number(id), {
    showExtra: 1,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: WorkerSchema) => updateWorker(id as string, data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message || ERROR_MESSAGE(MODEL, "update"),
      );
    },
  });

  function mapWorkerToForm(): Partial<WorkerSchema> {
    return {
      name: worker?.name ?? "",
      document: worker?.document ?? "",
      sede: worker?.sede ?? "",
      position: worker?.position ?? "",
      work_schedule_id: worker?.workSchedule?.id?.toString() ?? "",
      supervisor_id: worker?.supervisor_id?.toString() ?? "",
      worker_signature: null,
    };
  }

  if (loadingWorker || !worker) return <FormSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <PageWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="edit"
        icon={currentView.icon}
        backRoute={ABSOLUTE_ROUTE}
      />
      <WorkerForm
        defaultValues={mapWorkerToForm()}
        onSubmit={mutate}
        isSubmitting={isPending}
        workSchedule={worker.workSchedule}
        workerId={worker.id}
        workerName={worker.name}
      />
    </PageWrapper>
  );
}
