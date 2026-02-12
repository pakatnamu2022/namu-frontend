import { GeneralModal } from "@/shared/components/GeneralModal";
import { EquipmentTypeForm } from "./EquipmentTypeForm";
import { EquipmentTypeResource } from "../lib/equipmentType.interface";
import { EquipmentTypeSchema } from "../lib/equipmentType.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEquipmentTypeById } from "../lib/equipmentType.hook";
import {
  storeEquipmentType,
  updateEquipmentType,
} from "../lib/equipmentType.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { EQUIPMENT_TYPE } from "../lib/equipmentType.constants";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function EquipmentTypeModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const { EMPTY, MODEL, QUERY_KEY } = EQUIPMENT_TYPE;
  const queryClient = useQueryClient();
  const {
    data: equipmentType,
    isLoading: loadingEquipmentType,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : useEquipmentTypeById(id!);

  function mapEquipmentTypeToForm(
    data: EquipmentTypeResource,
  ): Partial<EquipmentTypeSchema> {
    return {
      name: data.name,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: EquipmentTypeSchema) =>
      mode === "create"
        ? storeEquipmentType(data)
        : updateEquipmentType(id!, data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, mode));
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      await refetch();
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message ?? ERROR_MESSAGE(MODEL, mode));
    },
  });

  const handleSubmit = (data: EquipmentTypeSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingEquipmentType || !equipmentType;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && equipmentType ? (
        <EquipmentTypeForm
          defaultValues={mapEquipmentTypeToForm(equipmentType)}
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
