import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTypeVehicleOriginById } from "../lib/typeVehicleOrigin.hook";
import { TypeVehicleOriginResource } from "../lib/typeVehicleOrigin.interface";
import { TypeVehicleOriginSchema } from "../lib/typeVehicleOrigin.schema";
import {
  storeTypeVehicleOrigin,
  updateTypeVehicleOrigin,
} from "../lib/typeVehicleOrigin.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { TypeVehicleOriginForm } from "./typeVehicleOriginForm";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { VEHICLE_ORIGIN } from "../lib/typeVehicleOrigin.constants";
import { AP_MASTER_TYPE } from "@/features/ap/ap-master/lib/apMaster.constants";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function TypeVehicleOriginModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { EMPTY, MODEL, QUERY_KEY } = VEHICLE_ORIGIN;
  const {
    data: TypeVehicleOrigin,
    isLoading: loadingTypeVehicleOrigin,
    refetch,
  } = mode === "create"
    ? {
        data: EMPTY,
        isLoading: false,
        refetch: () => {},
      }
    : useTypeVehicleOriginById(id!);

  function mapRoleToForm(
    data: TypeVehicleOriginResource
  ): Partial<TypeVehicleOriginSchema> {
    return {
      code: data.code,
      description: data.description,
      type: AP_MASTER_TYPE.VEHICLE_ORIGIN,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: TypeVehicleOriginSchema) =>
      mode === "create"
        ? storeTypeVehicleOrigin(data)
        : updateTypeVehicleOrigin(id!, data),
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

  const handleSubmit = (data: TypeVehicleOriginSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingTypeVehicleOrigin || !TypeVehicleOrigin;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && TypeVehicleOrigin ? (
        <TypeVehicleOriginForm
          defaultValues={mapRoleToForm(TypeVehicleOrigin)}
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
