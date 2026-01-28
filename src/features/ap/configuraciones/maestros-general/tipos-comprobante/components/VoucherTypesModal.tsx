import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useVoucherTypesById } from "../lib/voucherTypes.hook";
import { VoucherTypesResource } from "../lib/voucherTypes.interface";
import { VoucherTypesSchema } from "../lib/voucherTypes.schema";
import {
  storeVoucherTypes,
  updateVoucherTypes,
} from "../lib/voucherTypes.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { VoucherTypesForm } from "./VoucherTypesForm";
import { VOUCHER_TYPE } from "../lib/voucherTypes.constants";
import { AP_MASTER_TYPE } from "../../../../ap-master/lib/apMaster.constants";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function VoucherTypesModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { EMPTY, QUERY_KEY, MODEL } = VOUCHER_TYPE;
  const {
    data: voucherTypes,
    isLoading: loadingVoucherTypes,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : useVoucherTypesById(id!);

  function mapVoucherTypesToForm(
    data: VoucherTypesResource
  ): Partial<VoucherTypesSchema> {
    return {
      code: data.code,
      description: data.description,
      type: AP_MASTER_TYPE.VOUCHER_TYPE,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: VoucherTypesSchema) =>
      mode === "create"
        ? storeVoucherTypes(data)
        : updateVoucherTypes(id!, data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, mode));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY],
      });
      await refetch();
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message, ERROR_MESSAGE(MODEL, mode));
    },
  });

  const handleSubmit = (data: VoucherTypesSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingVoucherTypes || !voucherTypes;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && voucherTypes ? (
        <VoucherTypesForm
          defaultValues={mapVoucherTypesToForm(voucherTypes)}
          onCancel={onClose}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          mode={mode}
        />
      ) : (
        <FormSkeleton />
      )}
    </GeneralModal>
  );
}
