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
} from "@/core/core.function";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { FamiliesForm } from "./FamiliesForm";
import FormSkeleton from "@/shared/components/FormSkeleton";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  onSuccess?: (newFamily: FamiliesResource) => void;
  title: string;
  mode: "create" | "update";
  defaultBrandId?: string;
}

export default function FamiliesModal({
  id,
  open,
  onClose,
  onSuccess,
  title,
  mode,
  defaultBrandId,
}: Props) {
  const queryClient = useQueryClient();
  const { MODEL, QUERY_KEY } = FAMILIES;

  let updateQuery: ReturnType<typeof useFamiliesById> | null = null;
  if (mode === "update") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    updateQuery = useFamiliesById(id!);
  }

  const familiesData = updateQuery?.data;
  const loadingFamilies = updateQuery?.isLoading ?? false;
  const refetchFamilies = updateQuery?.refetch ?? (async () => undefined);

  function mapFamilyToForm(data: FamiliesResource): Partial<FamiliesSchema> {
    return {
      description: data.description,
      brand_id: String(data.brand_id),
      status: data.status,
    };
  }

  const createDefaultValues: Partial<FamiliesSchema> = {
    description: "",
    status: true,
    brand_id: defaultBrandId ?? "",
  };

  const defaultValues: Partial<FamiliesSchema> =
    mode === "create"
      ? createDefaultValues
      : familiesData
        ? mapFamilyToForm(familiesData)
        : {};

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FamiliesSchema) =>
      mode === "create" ? storeFamilies(data) : updateFamilies(id!, data),
    onSuccess: async (newFamily) => {
      successToast(SUCCESS_MESSAGE(MODEL, mode));
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      await refetchFamilies();
      onSuccess?.(newFamily as FamiliesResource);
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message, ERROR_MESSAGE(MODEL, mode));
    },
  });

  const handleSubmit = (data: FamiliesSchema) => {
    mutate(data as FamiliesSchema);
    onClose();
  };

  const isLoadingAny = mode === "update" && (loadingFamilies || !familiesData);

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {isLoadingAny ? (
        <FormSkeleton />
      ) : (
        <FamiliesForm
          defaultValues={defaultValues}
          onCancel={onClose}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          mode={mode}
        />
      )}
    </GeneralModal>
  );
}
