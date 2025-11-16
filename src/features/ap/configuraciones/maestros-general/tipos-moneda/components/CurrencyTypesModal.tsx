import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { CURRENCY_TYPES } from "../lib/CurrencyTypes.constants";
import { useCurrencyTypesById } from "../lib/CurrencyTypes.hook";
import { CurrencyTypesResource } from "../lib/CurrencyTypes.interface";
import { CurrencyTypesSchema } from "../lib/CurrencyTypes.schema";
import {
  storeCurrencyTypes,
  updateCurrencyTypes,
} from "../lib/CurrencyTypes.actions";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { CurrencyTypesForm } from "./CurrencyTypesForm";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function CurrencyTypesModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { EMPTY, MODEL, QUERY_KEY } = CURRENCY_TYPES;
  const {
    data: CurrencyTypes,
    isLoading: loadingCurrencyTypes,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : useCurrencyTypesById(id!);

  function mapCurrencyTypesToForm(
    data: CurrencyTypesResource
  ): Partial<CurrencyTypesSchema> {
    return {
      code: data.code,
      name: data.name,
      symbol: data.symbol,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CurrencyTypesSchema) =>
      mode === "create"
        ? storeCurrencyTypes(data)
        : updateCurrencyTypes(id!, data),
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

  const handleSubmit = (data: CurrencyTypesSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingCurrencyTypes || !CurrencyTypes;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && CurrencyTypes ? (
        <CurrencyTypesForm
          defaultValues={mapCurrencyTypesToForm(CurrencyTypes)}
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
