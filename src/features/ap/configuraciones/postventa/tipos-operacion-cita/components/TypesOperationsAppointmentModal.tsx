import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTypesOperationsAppointmentById } from "@/features/ap/configuraciones/postventa/tipos-operacion-cita/lib/typesOperationsAppointment.hook.ts";
import { TypesOperationsAppointmentResource } from "@/features/ap/configuraciones/postventa/tipos-operacion-cita/lib/typesOperationsAppointment.interface.ts";
import { TypesOperationsAppointmentSchema } from "@/features/ap/configuraciones/postventa/tipos-operacion-cita/lib/typesOperationsAppointment.schema.ts";
import {
  storeTypesOperationsAppointment,
  updateTypesOperationsAppointment,
} from "@/features/ap/configuraciones/postventa/tipos-operacion-cita/lib/typesOperationsAppointment.actions.ts";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function.ts";
import { GeneralModal } from "@/shared/components/GeneralModal.tsx";
import FormSkeleton from "@/shared/components/FormSkeleton.tsx";
import { TypesOperationsAppointmentForm } from "./TypesOperationsAppointmentForm.tsx";
import { AP_MASTER_POST_VENTA } from "@/features/ap/lib/ap.constants.ts";
import { TYPE_OPERACTION_APPOINTMENT } from "@/features/ap/configuraciones/postventa/tipos-operacion-cita/lib/typesOperationsAppointment.constants.ts";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function TypesOperationsAppointmentModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { EMPTY, MODEL, QUERY_KEY } = TYPE_OPERACTION_APPOINTMENT;
  const {
    data: TypesOperationsAppointment,
    isLoading: loadingTypesOperationsAppointment,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : // eslint-disable-next-line react-hooks/rules-of-hooks
      useTypesOperationsAppointmentById(id!);

  function mapRoleToForm(
    data: TypesOperationsAppointmentResource
  ): Partial<TypesOperationsAppointmentSchema> {
    return {
      code: data.code,
      description: data.description,
      type: AP_MASTER_POST_VENTA.TYPE_OPERACTION_APPOINTMENT,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: TypesOperationsAppointmentSchema) =>
      mode === "create"
        ? storeTypesOperationsAppointment(data)
        : updateTypesOperationsAppointment(id!, data),
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

  const handleSubmit = (data: TypesOperationsAppointmentSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny =
    loadingTypesOperationsAppointment || !TypesOperationsAppointment;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && TypesOperationsAppointment ? (
        <TypesOperationsAppointmentForm
          defaultValues={mapRoleToForm(TypesOperationsAppointment)}
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
