import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { ManualForm } from "./ManualForm";
import { useManualById } from "../lib/manual.hook";
import { storeManual, updateManual } from "../lib/manual.actions";
import { MANUAL } from "../lib/manual.constants";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import FormSkeleton from "@/shared/components/FormSkeleton";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function ManualModal({ id, open, onClose, title, mode }: Props) {
  const { EMPTY, MODEL, QUERY_KEY } = MANUAL;
  const queryClient = useQueryClient();

  const { data: manual, isLoading } =
    mode === "update" && id
      ? useManualById(id)
      : { data: EMPTY, isLoading: false };

  const { mutate, isPending } = useMutation({
    mutationFn: (data: any) =>
      mode === "create"
        ? storeManual(data)
        : updateManual(id!, data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, mode));
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      onClose();
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ?? ERROR_MESSAGE(MODEL, mode),
      );
    },
  });

  const handleSubmit = (data: any) => {
    const payload: Record<string, any> = {
      vista_id: Number(data.vista_id),
      title: data.title,
      order: data.order ?? 0,
    };
    if (data.description) payload.description = data.description;
    if (data.file instanceof File) payload.file = data.file;

    mutate(payload as any);
  };

  const showSkeleton = mode === "update" && (isLoading || !manual);

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={title}
      icon="BookOpen"
      size="xl"
    >
      {showSkeleton ? (
        <FormSkeleton />
      ) : (
        <ManualForm
          defaultValues={
            mode === "update" && manual
              ? {
                  vista_id: manual.vista_id,
                  title: manual.title,
                  description: manual.description ?? "",
                  order: manual.order,
                }
              : {}
          }
          existingFileUrl={mode === "update" ? manual?.s3_url : null}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isSubmitting={isPending}
          mode={mode}
        />
      )}
    </GeneralModal>
  );
}
