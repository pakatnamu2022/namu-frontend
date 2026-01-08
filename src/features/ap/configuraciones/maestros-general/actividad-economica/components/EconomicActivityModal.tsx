import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEconomicActivityById } from "../lib/economicActivity.hook";
import { EconomicActivityResource } from "../lib/economicActivity.interface";
import { EconomicActivitySchema } from "../lib/economicActivity.schema";
import {
  storeEconomicActivity,
  updateEconomicActivity,
} from "../lib/economicActivity.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { EconomicActivityForm } from "./EconomicActivityForm";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { ECONOMIC_ACTIVITY } from "../lib/economicActivity.constants";
import { AP_MASTER_TYPE } from "../../../../comercial/ap-master/lib/apMaster.constants";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function EconomicActivityModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { EMPTY, QUERY_KEY, MODEL } = ECONOMIC_ACTIVITY;
  const {
    data: economicActivityData,
    isLoading: loadingEconomicActivity,
    refetch,
  } = useEconomicActivityById(id!);

  const bank = mode === "create" ? EMPTY : economicActivityData;
  const isLoadingData = mode === "create" ? false : loadingEconomicActivity;

  function mapEconomicActivityToForm(
    data: EconomicActivityResource
  ): Partial<EconomicActivitySchema> {
    return {
      description: data.description,
      type: AP_MASTER_TYPE.ECONOMIC_ACTIVITY,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: EconomicActivitySchema) =>
      mode === "create"
        ? storeEconomicActivity(data)
        : updateEconomicActivity(id!, data),
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

  const handleSubmit = (data: EconomicActivitySchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };
  const isLoadingAny = isLoadingData || !bank;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && bank ? (
        <EconomicActivityForm
          defaultValues={mapEconomicActivityToForm(bank)}
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
