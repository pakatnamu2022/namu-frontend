import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BRAND_GROUP } from "../lib/brandGroup.constants";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { BrandGroupResource } from "../lib/brandGroup.interface";
import { BrandGroupSchema } from "../lib/brandGroup.schema";
import { storeBrandGroup, updateBrandGroup } from "../lib/brandGroup.actions";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { useBrandGroupById } from "../lib/brandGroup.hook";
import { BrandGroupForm } from "./BrandGroupForm";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { AP_MASTER_TYPE } from "@/features/ap/ap-master/lib/apMaster.constants";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function BrandGroupModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { MODEL, QUERY_KEY, EMPTY } = BRAND_GROUP;
  const {
    data: BrandGroup,
    isLoading: loadingBrandGroup,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : useBrandGroupById(id!);

  function mapRoleToForm(data: BrandGroupResource): Partial<BrandGroupSchema> {
    return {
      description: data.description,
      type: AP_MASTER_TYPE.GROUP_BRANDS,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: BrandGroupSchema) =>
      mode === "create" ? storeBrandGroup(data) : updateBrandGroup(id!, data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, mode));
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      await refetch();
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message, ERROR_MESSAGE(MODEL, mode));
    },
  });

  const handleSubmit = (data: BrandGroupSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingBrandGroup || !BrandGroup;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && BrandGroup ? (
        <BrandGroupForm
          defaultValues={mapRoleToForm(BrandGroup)}
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
