import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { GeneralModal } from "@/shared/components/GeneralModal";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { AttendanceExclusionForm } from "./AttendanceExclusionForm";
import {
  storeAttendanceExclusion,
  updateAttendanceExclusion,
} from "../lib/attendance-exclusion.actions";
import { useAttendanceExclusionById } from "../lib/attendance-exclusion.hook";
import { useAllWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import { ATTENDANCE_EXCLUSION } from "../lib/attendance-exclusion.constants";

const { MODEL, QUERY_KEY } = ATTENDANCE_EXCLUSION;

interface Props {
  id?: number | null;
  open: boolean;
  onClose: () => void;
  title: string;
}

export default function AttendanceExclusionModal({
  id,
  open,
  onClose,
  title,
}: Props) {
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const { data: persons, isLoading: isLoadingPersons } = useAllWorkers(
    { status_id: 22 },
    open && !isEdit,
  );

  const { data: exclusion, isLoading: isLoadingExclusion } =
    useAttendanceExclusionById(isEdit ? id : null);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: any) =>
      isEdit
        ? updateAttendanceExclusion(id as number, data)
        : storeAttendanceExclusion(data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, isEdit ? "update" : "create"));
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message,
        ERROR_MESSAGE(MODEL, isEdit ? "update" : "create"),
      );
    },
  });

  const handleSubmit = (data: any) => {
    mutate(data);
    onClose();
  };

  const isLoadingAny = isEdit
    ? isLoadingExclusion || !exclusion
    : isLoadingPersons || !persons;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny ? (
        <AttendanceExclusionForm
          isEdit={isEdit}
          defaultValues={
            isEdit
              ? {
                  reason: exclusion?.reason ?? "",
                  active: exclusion?.active ?? true,
                }
              : {
                  person_id: "",
                  reason: "",
                  active: true,
                }
          }
          persons={persons}
          personLabel={exclusion?.person?.name}
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
