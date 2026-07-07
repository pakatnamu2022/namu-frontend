import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BRAND } from "../lib/brands.constants";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { BrandsSchema } from "../lib/brands.schema";
import { storeBrands } from "../lib/brands.actions";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { BrandsForm } from "./BrandsForm";
import { BrandsResource } from "../lib/brands.interface";
import { CM_POSTVENTA_ID } from "@/features/ap/ap-master/lib/apMaster.constants";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: (newBrand: BrandsResource) => void;
  title: string;
}

export default function BrandsModal({
  open,
  onClose,
  onSuccess,
  title,
}: Props) {
  const queryClient = useQueryClient();
  const { MODEL, QUERY_KEY } = BRAND;

  const { mutate, isPending } = useMutation({
    mutationFn: (data: BrandsSchema) => storeBrands(data),
    onSuccess: async (newBrand) => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      onSuccess?.(newBrand);
      onClose();
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message, ERROR_MESSAGE(MODEL, "create"));
    },
  });

  const handleSubmit = (data: BrandsSchema) => {
    mutate(data);
  };

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      <BrandsForm
        defaultValues={{
          code: "-",
          dyn_code: "-",
          name: "",
          description: "",
          group_id: "",
          type_operation_id: String(CM_POSTVENTA_ID),
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
        onCancel={onClose}
        hideModalFields
      />
    </GeneralModal>
  );
}
