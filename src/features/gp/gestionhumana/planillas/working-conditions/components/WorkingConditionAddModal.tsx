"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { importWorkingConditions } from "../lib/working-condition.actions";
import { WorkingConditionSchema } from "../lib/working-condition.schema";
import { WORKING_CONDITION } from "../lib/working-condition.constant";
import { WorkingConditionForm } from "./WorkingConditionForm";
import { GeneralModal } from "@/shared/components/GeneralModal";

const { MODEL, QUERY_KEY } = WORKING_CONDITION;

interface WorkingConditionAddModalProps {
  open: boolean;
  onClose: () => void;
  companyId: string;
}

export default function WorkingConditionAddModal({
  open,
  onClose,
  companyId,
}: WorkingConditionAddModalProps) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: ({ data, file }: { data: WorkingConditionSchema; file: File }) =>
      importWorkingConditions(file, data.period_id),
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      onClose();
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ?? ERROR_MESSAGE(MODEL, "create"),
      );
    },
  });

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={`Agregar ${MODEL.name}`}
      icon="Briefcase"
      size="md"
    >
      <WorkingConditionForm
        companyId={companyId}
        onSubmit={(data, file) => mutate({ data, file })}
        isSubmitting={isPending}
        onCancel={onClose}
      />
    </GeneralModal>
  );
}
