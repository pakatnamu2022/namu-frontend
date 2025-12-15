"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ParEvaluatorForm } from "./ParEvaluatorForm";
import { useAllWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { ParEvaluatorSchema } from "../lib/par-evaluator.schema";
import { ParEvaluatorResource } from "../lib/par-evaluator.interface";
import { STATUS_WORKER } from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.constant";

interface ParEvaluatorEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parEvaluatorId: number | null;
  workerId: number | null;
  existingEvaluators?: ParEvaluatorResource[];
  defaultValues?: Partial<ParEvaluatorSchema>;
  onSubmit: (data: ParEvaluatorSchema) => void;
  isSubmitting?: boolean;
}

export function ParEvaluatorEditModal({
  open,
  onOpenChange,
  workerId,
  existingEvaluators = [],
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: ParEvaluatorEditModalProps) {
  const { data: workersData, isLoading: loadingWorkers } = useAllWorkers({
    status_id: STATUS_WORKER.ACTIVE,
  });

  const handleSubmit = (data: ParEvaluatorSchema) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full overflow-auto max-w-2xl">
        <DialogHeader>
          <DialogTitle>Asignar Evaluador Par</DialogTitle>
        </DialogHeader>

        {loadingWorkers ? (
          <FormSkeleton />
        ) : (
          <ParEvaluatorForm
            persons={workersData || []}
            existingEvaluators={existingEvaluators}
            defaultValues={{
              ...defaultValues,
              worker_id: workerId?.toString() || undefined,
            }}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            mode="update"
            showCancelButton={false}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
