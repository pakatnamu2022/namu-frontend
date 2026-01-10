import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupplierOrderTypeById } from "../lib/supplierOrderType.hook";
import { SupplierOrderTypeResource } from "../lib/supplierOrderType.interface";
import { SupplierOrderTypeSchema } from "../lib/supplierOrderType.schema";
import {
  storeSupplierOrderType,
  updateSupplierOrderType,
} from "../lib/supplierOrderType.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { SupplierOrderTypeForm } from "./SupplierOrderTypeForm";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { SUPPLIER_ORDER_TYPE } from "../lib/supplierOrderType.constants";
import { AP_MASTER_TYPE } from "@/features/ap/ap-master/lib/apMaster.constants";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function SupplierOrderTypeModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { EMPTY, MODEL, QUERY_KEY } = SUPPLIER_ORDER_TYPE;
  const {
    data: SupplierOrderType,
    isLoading: loadingSupplierOrderType,
    refetch,
  } = mode === "create"
    ? {
        data: EMPTY,
        isLoading: false,
        refetch: () => {},
      }
    : useSupplierOrderTypeById(id!);

  function mapRoleToForm(
    data: SupplierOrderTypeResource
  ): Partial<SupplierOrderTypeSchema> {
    return {
      code: data.code,
      description: data.description,
      type: AP_MASTER_TYPE.SUPPLIER_ORDER_TYPE,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: SupplierOrderTypeSchema) =>
      mode === "create"
        ? storeSupplierOrderType(data)
        : updateSupplierOrderType(id!, data),
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

  const handleSubmit = (data: SupplierOrderTypeSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingSupplierOrderType || !SupplierOrderType;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && SupplierOrderType ? (
        <SupplierOrderTypeForm
          defaultValues={mapRoleToForm(SupplierOrderType)}
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
