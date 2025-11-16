import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ExcludedSchema } from "../lib/excluded.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import { GeneralModal } from "@/src/shared/components/GeneralModal";
import FormSkeleton from "@/src/shared/components/FormSkeleton";
import { ExcludedForm } from "./ExcludedForm";
import { storeEvaluationPersonDetail } from "../lib/excluded.actions";
import { useAllWorkers } from "../../../personal/trabajadores/lib/worker.hook";
import { EXCLUDED } from "../lib/excluded.constants";

const { MODEL, QUERY_KEY } = EXCLUDED;

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
}

export default function ExcludedModal({ open, onClose, title }: Props) {
  const queryClient = useQueryClient();

  const { data: persons, isLoading: isLoadingPersons } = useAllWorkers({
    status_id: 22,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ExcludedSchema) => storeEvaluationPersonDetail(data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY],
      });
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message, ERROR_MESSAGE(MODEL, "create"));
    },
  });

  const handleSubmit = (data: ExcludedSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = !persons || isLoadingPersons;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && persons ? (
        <ExcludedForm
          defaultValues={{
            person_id: "",
          }}
          persons={persons}
          onCancel={onClose}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
        />
      ) : (
        <FormSkeleton />
      )}
    </GeneralModal>
  );
}
