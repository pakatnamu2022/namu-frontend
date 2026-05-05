"use client";

import { GeneralModal } from "@/shared/components/GeneralModal";
import { ObjectiveForm } from "./ObjectiveForm";
import { ObjectiveSchema } from "../lib/objective.schema";
import { SUBTITLE } from "@/core/core.function";
import { OBJECTIVE } from "../lib/objective.constants";

interface ObjectiveModalProps {
  open: boolean;
  onClose: () => void;
  defaultValues?: Partial<ObjectiveSchema>;
  onSubmit: (data: ObjectiveSchema) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export function ObjectiveModal({
  open,
  onClose,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: ObjectiveModalProps) {
  const { MODEL } = OBJECTIVE;
  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Agregar objetivo" : "Editar objetivo"}
      subtitle={SUBTITLE(MODEL, mode)}
      icon="Dumbbell"
      size="xl"
    >
      <ObjectiveForm
        defaultValues={defaultValues ?? {}}
        onSubmit={onSubmit}
        onCancel={onClose}
        isSubmitting={isSubmitting}
        mode={mode}
      />
    </GeneralModal>
  );
}
