import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGearShiftTypeById } from "../lib/gearShiftType.hook";
import { GearShiftTypeResource } from "../lib/gearShiftType.interface";
import { GearShiftTypeSchema } from "../lib/gearShiftType.schema";
import {
  storeGearShiftType,
  updateGearShiftType,
} from "../lib/gearShiftType.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { GearShiftTypeForm } from "./GearShiftTypeForm";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { TYPE_TRANSMISSION } from "../lib/gearShiftType.constants";
import { AP_MASTER_COMERCIAL } from "@/features/ap/lib/ap.constants";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function GearShiftTypeModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { EMPTY, MODEL, QUERY_KEY } = TYPE_TRANSMISSION;
  const {
    data: GearShiftType,
    isLoading: loadingGearShiftType,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : useGearShiftTypeById(id!);

  function mapGearShiftTypeToForm(
    data: GearShiftTypeResource
  ): Partial<GearShiftTypeSchema> {
    return {
      code: data.code,
      description: data.description,
      type: AP_MASTER_COMERCIAL.TRANSMISION_VEHICLE,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: GearShiftTypeSchema) =>
      mode === "create"
        ? storeGearShiftType(data)
        : updateGearShiftType(id!, data),
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

  const handleSubmit = (data: GearShiftTypeSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingGearShiftType || !GearShiftType;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && GearShiftType ? (
        <GearShiftTypeForm
          defaultValues={mapGearShiftTypeToForm(GearShiftType)}
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
