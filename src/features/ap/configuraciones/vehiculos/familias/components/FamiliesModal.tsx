import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FAMILIES } from "../lib/families.constants";
import { FamiliesResource } from "../lib/families.interface";
import { FamiliesSchema } from "../lib/families.schema";
import { useFamiliesById } from "../lib/families.hook";
import { storeFamilies, updateFamilies } from "../lib/families.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import { GeneralModal } from "@/src/shared/components/GeneralModal";
import { FamiliesForm } from "./FamiliesForm";
import FormSkeleton from "@/src/shared/components/FormSkeleton";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function FamiliesModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { MODEL, EMPTY, QUERY_KEY } = FAMILIES;
  const {
    data: Families,
    isLoading: loadingFamilies,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : useFamiliesById(id!);

  function mapRoleToForm(
    data: FamiliesResource | FamiliesSchema
  ): Partial<FamiliesSchema> {
    return {
      description: data.description,
      brand_id: String(data.brand_id),
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FamiliesSchema) =>
      mode === "create" ? storeFamilies(data) : updateFamilies(id!, data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, mode));
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      await refetch();
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message, ERROR_MESSAGE(MODEL, mode));
    },
  });

  const handleSubmit = (data: FamiliesSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingFamilies || !Families;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && Families ? (
        <FamiliesForm
          defaultValues={mapRoleToForm(Families)}
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
