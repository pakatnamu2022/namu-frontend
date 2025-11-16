import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BodyTypeResource } from "../lib/bodyType.interface";
import { useBodyTypeById } from "../lib/bodyType.hook";
import { BodyTypeSchema } from "../lib/bodyType.schema";
import { storeBodyType, updateBodyType } from "../lib/bodyType.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import { GeneralModal } from "@/src/shared/components/GeneralModal";
import FormSkeleton from "@/src/shared/components/FormSkeleton";
import { BodyTypeForm } from "./BodyTypeForm";
import { BODY_TYPE } from "../lib/bodyType.constants";
import { AP_MASTER_COMERCIAL } from "@/src/features/ap/lib/ap.constants";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function BodyTypeModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { EMPTY, MODEL, QUERY_KEY } = BODY_TYPE;
  const {
    data: BodyType,
    isLoading: loadingBodyType,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : useBodyTypeById(id!);

  function mapRoleToForm(data: BodyTypeResource): Partial<BodyTypeSchema> {
    return {
      code: data.code,
      description: data.description,
      type: AP_MASTER_COMERCIAL.BODY_TYPE,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: BodyTypeSchema) =>
      mode === "create" ? storeBodyType(data) : updateBodyType(id!, data),
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

  const handleSubmit = (data: BodyTypeSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingBodyType || !BodyType;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && BodyType ? (
        <BodyTypeForm
          defaultValues={mapRoleToForm(BodyType)}
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
