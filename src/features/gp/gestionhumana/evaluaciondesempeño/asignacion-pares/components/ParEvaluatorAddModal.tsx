"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ParEvaluatorForm } from "./ParEvaluatorForm";
import { useAllWorkers } from "../../../personal/trabajadores/lib/worker.hook";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { ParEvaluatorSchema } from "../lib/par-evaluator.schema";
import { ParEvaluatorResource } from "../lib/par-evaluator.interface";
import { STATUS_WORKER } from "../../../personal/posiciones/lib/position.constant";
import { useEffect, useState } from "react";
import { getAllParEvaluators } from "../lib/par-evaluator.actions";

interface ParEvaluatorAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workerId?: number | null;
  onSubmit: (data: ParEvaluatorSchema) => void;
  isSubmitting?: boolean;
}

export function ParEvaluatorAddModal({
  open,
  onOpenChange,
  workerId,
  onSubmit,
  isSubmitting = false,
}: ParEvaluatorAddModalProps) {
  const { data: workersData, isLoading: loadingWorkers } = useAllWorkers({
    status_id: STATUS_WORKER.ACTIVE,
  });

  const [existingEvaluators, setExistingEvaluators] = useState<
    ParEvaluatorResource[]
  >([]);
  const [loadingExisting, setLoadingExisting] = useState(false);

  // Cargar evaluadores existentes si hay un workerId
  useEffect(() => {
    const loadExistingEvaluators = async () => {
      if (!workerId) {
        setExistingEvaluators([]);
        return;
      }

      setLoadingExisting(true);
      try {
        const evaluators = await getAllParEvaluators({
          params: {
            worker_id: workerId,
          },
        });
        setExistingEvaluators(evaluators || []);
      } catch (error) {
        console.error("Error loading existing evaluators:", error);
        setExistingEvaluators([]);
      } finally {
        setLoadingExisting(false);
      }
    };

    if (open) {
      loadExistingEvaluators();
    }
  }, [workerId, open]);

  const handleSubmit = (data: ParEvaluatorSchema) => {
    onSubmit(data);
  };

  const isLoading = loadingWorkers || loadingExisting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full overflow-auto max-w-2xl">
        <DialogHeader>
          <DialogTitle>Asignar Evaluadores Par</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <FormSkeleton />
        ) : (
          <ParEvaluatorForm
            persons={workersData || []}
            existingEvaluators={existingEvaluators}
            defaultValues={{
              worker_id: workerId?.toString() || undefined,
              mate_ids: [],
            }}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            mode="create"
            showCancelButton={false}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
