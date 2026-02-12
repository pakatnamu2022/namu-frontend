import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AccountantDistrictAssignmentResource } from "../lib/accountantDistrictAssignment.interface";
import { AccountantDistrictAssignmentSchema } from "../lib/accountantDistrictAssignment.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { GeneralModal } from "@/shared/components/GeneralModal";
import {
  storeAccountantDistrictAssignment,
  updateAccountantDistrictAssignment,
} from "../lib/accountantDistrictAssignment.actions";
import { useFindAccountantDistrictAssignmentById } from "../lib/accountantDistrictAssignment.hook";
import { AccountantDistrictAssignmentForm } from "./AccountantDistrictAssignmentForm";
import { ACCOUNTANT_DISTRICT_ASSIGNMENT } from "../lib/accountantDistrictAssignment.constants";
import { ViewsResponseMenuChild } from "@/features/views/lib/views.interface";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
  currentView: ViewsResponseMenuChild | null;
}

export default function AccountantDistrictAssignmentModal({
  id,
  open,
  onClose,
  title,
  mode,
  currentView,
}: Props) {
  const queryClient = useQueryClient();
  const { MODEL, QUERY_KEY, EMPTY } = ACCOUNTANT_DISTRICT_ASSIGNMENT;
  const {
    data: accountantDistrictAssignment,
    isLoading: loadingAccountantDistrictAssignment,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : // eslint-disable-next-line react-hooks/rules-of-hooks
      useFindAccountantDistrictAssignmentById(id!);

  function mapAccountantDistrictAssignmentToForm(
    data: AccountantDistrictAssignmentResource,
  ): Partial<AccountantDistrictAssignmentSchema> {
    return {
      worker_id: data.worker?.id.toString(),
      district_id: data.district?.id.toString(),
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: AccountantDistrictAssignmentSchema) =>
      mode === "create"
        ? storeAccountantDistrictAssignment(data)
        : updateAccountantDistrictAssignment(id!, data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, mode));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY],
      });
      await refetch();
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message || ERROR_MESSAGE(MODEL, mode));
    },
  });

  const handleSubmit = (data: AccountantDistrictAssignmentSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny =
    loadingAccountantDistrictAssignment ||
    !accountantDistrictAssignment ||
    !currentView;

  const workerDefaultOption =
    mode === "update" && accountantDistrictAssignment?.worker
      ? {
          value: accountantDistrictAssignment.worker.id.toString(),
          label: accountantDistrictAssignment.worker.name,
          description: `${accountantDistrictAssignment.worker.document} - ${accountantDistrictAssignment.worker.position}`,
        }
      : undefined;

  const districtDefaultOption =
    mode === "update" && accountantDistrictAssignment?.district
      ? {
          value: accountantDistrictAssignment.district.id.toString(),
          label: accountantDistrictAssignment.district.name,
          description: `${accountantDistrictAssignment.district.province} - ${accountantDistrictAssignment.district.department}`,
        }
      : undefined;

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={title}
      icon={currentView?.icon}
    >
      {!isLoadingAny && accountantDistrictAssignment ? (
        <AccountantDistrictAssignmentForm
          defaultValues={mapAccountantDistrictAssignmentToForm(
            accountantDistrictAssignment as AccountantDistrictAssignmentResource,
          )}
          onCancel={onClose}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          mode={mode}
          workerDefaultOption={workerDefaultOption}
          districtDefaultOption={districtDefaultOption}
        />
      ) : (
        <FormSkeleton />
      )}
    </GeneralModal>
  );
}
