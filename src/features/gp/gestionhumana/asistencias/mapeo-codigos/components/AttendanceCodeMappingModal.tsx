import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { GeneralModal } from "@/shared/components/GeneralModal";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { AttendanceCodeMappingForm } from "./AttendanceCodeMappingForm";
import {
  storeAttendanceCodeMapping,
  updateAttendanceCodeMapping,
} from "../lib/attendance-code-mapping.actions";
import { useAttendanceCodeMappingById } from "../lib/attendance-code-mapping.hook";
import { ATTENDANCE_CODE_MAPPING } from "../lib/attendance-code-mapping.constants";

const { MODEL, QUERY_KEY } = ATTENDANCE_CODE_MAPPING;

interface Props {
  id?: number | null;
  open: boolean;
  onClose: () => void;
  title: string;
}

export default function AttendanceCodeMappingModal({
  id,
  open,
  onClose,
  title,
}: Props) {
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const { data: mapping, isLoading: isLoadingMapping } =
    useAttendanceCodeMappingById(isEdit ? id : null);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: any) =>
      isEdit
        ? updateAttendanceCodeMapping(id as number, data)
        : storeAttendanceCodeMapping(data),
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

  const isLoadingAny = isEdit ? isLoadingMapping || !mapping : false;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny ? (
        <AttendanceCodeMappingForm
          isEdit={isEdit}
          defaultValues={
            isEdit
              ? {
                  emp_code: mapping?.emp_code ?? "",
                  vat: mapping?.vat ?? "",
                  note: mapping?.note ?? "",
                }
              : {
                  emp_code: "",
                  vat: "",
                  note: "",
                }
          }
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
