"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ParEvaluatorForm } from "./ParEvaluatorForm";
import { useWorkers } from "../../../personal/trabajadores/lib/worker.hook";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { ParEvaluatorSchema } from "../lib/par-evaluator.schema";

interface ParEvaluatorEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parEvaluatorId: number | null;
  workerId: number | null;
  defaultValues?: Partial<ParEvaluatorSchema>;
  onSubmit: (data: ParEvaluatorSchema) => void;
  isSubmitting?: boolean;
}

export function ParEvaluatorEditModal({
  open,
  onOpenChange,
  parEvaluatorId,
  workerId,
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: ParEvaluatorEditModalProps) {
  const { data: workersData, isLoading: loadingWorkers } = useWorkers();

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
            persons={workersData?.data || []}
            defaultValues={{
              ...defaultValues,
              worker_id: workerId || undefined,
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
