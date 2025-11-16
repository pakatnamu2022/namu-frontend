import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import { GeneralModal } from "@/src/shared/components/GeneralModal";
import FormSkeleton from "@/src/shared/components/FormSkeleton";
import { TYPE_GENDER } from "../lib/typesGender.constants";
import { useTypeGenderById } from "../lib/typesGender.hook";
import { TypeGenderResource } from "../lib/typesGender.interface";
import { TypeGenderSchema } from "../lib/typesGender.schema";
import { storeTypeGender, updateTypeGender } from "../lib/typesGender.actions";
import { TypeGenderForm } from "./TypesGenderForm";
import { AP_MASTER_COMERCIAL } from "../../../../lib/ap.constants";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function TypeGenderModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { EMPTY, QUERY_KEY, MODEL } = TYPE_GENDER;
  const {
    data: bank,
    isLoading: loadingTypeGender,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : useTypeGenderById(id!);

  function mapTypeGenderToForm(
    data: TypeGenderResource
  ): Partial<TypeGenderSchema> {
    return {
      description: data.description,
      type: AP_MASTER_COMERCIAL.TYPE_GENDER,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: TypeGenderSchema) =>
      mode === "create" ? storeTypeGender(data) : updateTypeGender(id!, data),
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

  const handleSubmit = (data: TypeGenderSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingTypeGender || !bank;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && bank ? (
        <TypeGenderForm
          defaultValues={mapTypeGenderToForm(bank)}
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
