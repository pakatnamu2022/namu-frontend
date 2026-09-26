"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { importBonuses } from "../lib/bonus.actions";
import { BonusImportSchema } from "../lib/bonus.schema";
import { BONUS } from "../lib/bonus.constant";
import { BonusImportForm } from "./BonusImportForm";
import { GeneralModal } from "@/shared/components/GeneralModal";

const { MODEL, QUERY_KEY } = BONUS;

interface BonusImportModalProps {
  open: boolean;
  onClose: () => void;
  companyId: string;
  companyName?: string;
}

export default function BonusImportModal({
  open,
  onClose,
  companyId,
  companyName,
}: BonusImportModalProps) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: ({
      data,
      file,
    }: {
      data: BonusImportSchema;
      file: File;
    }) => importBonuses(file, data.period_id, data.type_id),
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
      title={`Importar ${MODEL.name}`}
      icon="BadgeDollarSign"
      size="md"
    >
      <BonusImportForm
        companyId={companyId}
        companyName={companyName}
        onSubmit={(data, file) => mutate({ data, file })}
        isSubmitting={isPending}
        onCancel={onClose}
      />
    </GeneralModal>
  );
}
