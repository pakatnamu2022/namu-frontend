import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { TaxClassTypesForm } from "./TaxClassTypesForm";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { TAX_CLASS_TYPES } from "../lib/taxClassTypes.constants";
import { useTaxClassTypesById } from "../lib/taxClassTypes.hook";
import { TaxClassTypesResource } from "../lib/taxClassTypes.interface";
import { TaxClassTypesSchema } from "../lib/taxClassTypes.schema";
import {
  storeTaxClassTypes,
  updateTaxClassTypes,
} from "../lib/taxClassTypes.actions";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function TaxClassTypesModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { EMPTY, QUERY_KEY, MODEL } = TAX_CLASS_TYPES;
  const {
    data: bank,
    isLoading: loadingTaxClassTypes,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : useTaxClassTypesById(id!);

  function mapTaxClassTypesToForm(
    data: TaxClassTypesResource
  ): Partial<TaxClassTypesSchema> {
    return {
      dyn_code: data.dyn_code,
      description: data.description,
      tax_class: data.tax_class,
      type: data.type,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: TaxClassTypesSchema) =>
      mode === "create"
        ? storeTaxClassTypes(data)
        : updateTaxClassTypes(id!, data),
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

  const handleSubmit = (data: TaxClassTypesSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingTaxClassTypes || !bank;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && bank ? (
        <TaxClassTypesForm
          defaultValues={mapTaxClassTypesToForm(bank)}
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
